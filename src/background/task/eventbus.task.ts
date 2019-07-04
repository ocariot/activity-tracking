import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { DI } from '../../di/di'
import { PhysicalActivityEvent } from '../../application/integration-event/event/physical.activity.event'
import { IPhysicalActivityRepository } from '../../application/port/physical.activity.repository.interface'
import { SleepEvent } from '../../application/integration-event/event/sleep.event'
import { ISleepRepository } from '../../application/port/sleep.repository.interface'
import { EnvironmentEvent } from '../../application/integration-event/event/environment.event'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { IIntegrationEventRepository } from '../../application/port/integration.event.repository.interface'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { Environment } from '../../application/domain/model/environment'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { UserEvent } from '../../application/integration-event/event/user.event'
import { UserDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { InstitutionEvent } from '../../application/integration-event/event/institution.event'
import { InstitutionDeleteEventHandler } from '../../application/integration-event/handler/institution.delete.event.handler'
import { IBodyFatRepository } from '../../application/port/body.fat.repository.interface'
import { IWeightRepository } from '../../application/port/weight.repository.interface'
import { BodyFatEvent } from '../../application/integration-event/event/body.fat.event'
import { BodyFat } from '../../application/domain/model/body.fat'
import { WeightEvent } from '../../application/integration-event/event/weight.event'
import { Weight } from '../../application/domain/model/weight'

@injectable()
export class EventBusTask {
    private readonly _diContainer: Container
    private handlerPub: any

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._diContainer = DI.getInstance().getContainer()
        this._eventBus.enableLogger(true)
    }

    public run(): void {
        this.subscribeEvents()
        this.publishSavedEvents()
    }

    public async stop(): Promise<void> {
        try {
            await this._eventBus.dispose()
            if (this.handlerPub) clearInterval(this.handlerPub)
        } catch (err) {
            return Promise.reject(new Error(`Error stopping EventBusTask! ${err.message}`))
        }
    }

    /**
     *  Before performing the subscribe is trying to connect to the bus.
     *  If there is no connection, infinite attempts will be made until
     *  the connection is established successfully. Once you have the
     *  connection, event registration is performed.
     */
    private subscribeEvents(): void {
        this._eventBus.connectionSub
            .tryConnect(0, 1500)
            .then(() => {
                this._logger.info('Connection to subscribe established successfully!')

                /**
                 * Subscribe in event user delete
                 */
                const userDeleteEvent = new UserEvent('UserDeleteEvent', new Date())
                const userDeleteEventHandler = new UserDeleteEventHandler(
                    this._diContainer.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY),
                    this._diContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY),
                    this._diContainer.get<IBodyFatRepository>(Identifier.BODY_FAT_REPOSITORY),
                    this._diContainer.get<IWeightRepository>(Identifier.WEIGHT_REPOSITORY), this._logger)
                this._eventBus
                    .subscribe(userDeleteEvent, userDeleteEventHandler, 'users.delete')
                    .then((result: boolean) => {
                        if (result) this._logger.info('Subscribe in UserDeleteEvent successful!')
                    })
                    .catch(err => {
                        this._logger.error(`Error in Subscribe UserDeleteEvent! ${err.message}`)
                    })

                /**
                 * Subscribe in event institution delete
                 */
                const institutionDeleteEvent = new InstitutionEvent('InstitutionDeleteEvent', new Date())
                const institutionDeleteEventHandler = new InstitutionDeleteEventHandler(
                    this._diContainer.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), this._logger)
                this._eventBus
                    .subscribe(institutionDeleteEvent, institutionDeleteEventHandler, 'institutions.delete')
                    .then((result: boolean) => {
                        if (result) this._logger.info('Subscribe in InstitutionDeleteEvent successful!')
                    })
                    .catch(err => {
                        this._logger.error(`Error in Subscribe InstitutionDeleteEvent! ${err.message}`)
                    })
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event subscribe. ${err.message}`)
            })
    }

    /**
     * It publishes events, that for some reason could not
     * be sent and were saved for later submission.
     */
    private publishSavedEvents(): void {
        this._eventBus.connectionPub
            .tryConnect(0, 1500)
            .then(async () => {
                this._logger.info('Connection to publish established successfully!')
                await this.internalPublishSavedEvents(this.publishEvent, this._eventBus,
                    this._integrationEventRepository, this._logger)

                this.handlerPub = setInterval(this.internalPublishSavedEvents, 300000, // 5min
                    this.publishEvent,
                    this._eventBus,
                    this._integrationEventRepository,
                    this._logger)
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event publishing. ${err.message}`)
            })
    }

    private async internalPublishSavedEvents(
        publishEvent: any, eventBus: IEventBus, integrationEventRepository: IIntegrationEventRepository,
        logger: ILogger): Promise<void> {
        if (!eventBus.connectionPub.isConnected) return

        try {
            const result: Array<any> = await integrationEventRepository.find(new Query())
            result.forEach((item: IntegrationEvent<any>) => {
                const event: any = item.toJSON()
                publishEvent(event, eventBus)
                    .then(pubResult => {
                        if (pubResult) {
                            logger.info(`Event with name ${event.event_name}, which was saved, `
                                .concat(`was successfully published to the event bus.`))
                            integrationEventRepository.delete(event.id)
                                .catch(err => {
                                    logger.error(`Error trying to remove saved event: ${err.message}`)
                                })
                        }
                    })
                    .catch(() => {
                        logger.error(`Error while trying to publish event saved with ID: ${event.id}`)
                    })
            })
        } catch (err) {
            logger.error(`Error retrieving saved events: ${err.message}`)
        }
    }

    private publishEvent(event: any, eventBus: IEventBus): Promise<boolean> {
        if (event.event_name === 'PhysicalActivitySaveEvent') {
            const physicalActivitySaveEvent: PhysicalActivityEvent = new PhysicalActivityEvent(
                event.event_name,
                event.timestamp,
                new PhysicalActivity().fromJSON(event.physicalactivity)
            )
            return eventBus.publish(physicalActivitySaveEvent, event.__routing_key)
        } else if (event.event_name === 'PhysicalActivityUpdateEvent') {
            const physicalActivityUpdateEvent: PhysicalActivityEvent = new PhysicalActivityEvent(
                event.event_name,
                event.timestamp,
                new PhysicalActivity().fromJSON(event.physicalactivity)
            )
            return eventBus.publish(physicalActivityUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'PhysicalActivityDeleteEvent') {
            const physicalActivityDeleteEvent: PhysicalActivityEvent = new PhysicalActivityEvent(
                event.event_name,
                event.timestamp,
                new PhysicalActivity().fromJSON(event.physicalactivity)
            )
            return eventBus.publish(physicalActivityDeleteEvent, event.__routing_key)
        } else if (event.event_name === 'SleepSaveEvent') {
            const sleepSaveEvent: SleepEvent = new SleepEvent(
                event.event_name,
                event.timestamp,
                new Sleep().fromJSON(event.sleep)
            )
            return eventBus.publish(sleepSaveEvent, event.__routing_key)
        } else if (event.event_name === 'SleepUpdateEvent') {
            const sleepUpdateEvent: SleepEvent = new SleepEvent(
                event.event_name,
                event.timestamp,
                new Sleep().fromJSON(event.sleep)
            )
            return eventBus.publish(sleepUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'SleepDeleteEvent') {
            const sleepDeleteEvent: SleepEvent = new SleepEvent(
                event.event_name,
                event.timestamp,
                new Sleep().fromJSON(event.sleep)
            )
            return eventBus.publish(sleepDeleteEvent, event.__routing_key)
        } else if (event.event_name === 'BodyFatSaveEvent') {
            const bodyFatSaveEvent: BodyFatEvent = new BodyFatEvent(
                event.event_name,
                event.timestamp,
                new BodyFat().fromJSON(event.body_fat)
            )
            return eventBus.publish(bodyFatSaveEvent, event.__routing_key)
        } else if (event.event_name === 'BodyFatDeleteEvent') {
            const bodyFatDeleteEvent: BodyFatEvent = new BodyFatEvent(
                event.event_name,
                event.timestamp,
                new BodyFat().fromJSON(event.body_fat)
            )
            return eventBus.publish(bodyFatDeleteEvent, event.__routing_key)
        } else if (event.event_name === 'WeightSaveEvent') {
            const weightSaveEvent: WeightEvent = new WeightEvent(
                event.event_name,
                event.timestamp,
                new Weight().fromJSON(event.weight)
            )
            return eventBus.publish(weightSaveEvent, event.__routing_key)
        } else if (event.event_name === 'WeightDeleteEvent') {
            const weightDeleteEvent: WeightEvent = new WeightEvent(
                event.event_name,
                event.timestamp,
                new Weight().fromJSON(event.weight)
            )
            return eventBus.publish(weightDeleteEvent, event.__routing_key)
        } else if (event.event_name === 'EnvironmentSaveEvent') {
            const environmentSaveEvent: EnvironmentEvent = new EnvironmentEvent(
                event.event_name,
                event.timestamp,
                new Environment().fromJSON(event.environment)
            )
            return eventBus.publish(environmentSaveEvent, event.__routing_key)
        } else if (event.event_name === 'EnvironmentDeleteEvent') {
            const environmentDeleteEvent: EnvironmentEvent = new EnvironmentEvent(
                event.event_name,
                event.timestamp,
                new Environment().fromJSON(event.environment)
            )
            return eventBus.publish(environmentDeleteEvent, event.__routing_key)
        }

        return Promise.resolve(false)
    }
}
