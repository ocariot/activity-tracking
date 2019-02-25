import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { DI } from '../../di/di'
import { PhysicalActivitySaveEvent } from '../../application/integration-event/event/physical.activity.save.event'
import { PhysicalActivitySaveEventHandler } from '../../application/integration-event/handler/physical.activity.save.event.handler'
import { IPhysicalActivityRepository } from '../../application/port/physical.activity.repository.interface'
import { SleepSaveEvent } from '../../application/integration-event/event/sleep.save.event'
import { SleepSaveEventHandler } from '../../application/integration-event/handler/sleep.save.event.handler'
import { ISleepRepository } from '../../application/port/sleep.repository.interface'
import { EnvironmentSaveEvent } from '../../application/integration-event/event/environment.save.event'
import { EnvironmentSaveEventHandler } from '../../application/integration-event/handler/environment.save.event.handler'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { IIntegrationEventRepository } from '../../application/port/integration.event.repository.interface'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { Environment } from '../../application/domain/model/environment'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'

@injectable()
export class EventBusTask {
    private readonly _diContainer: Container

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
                 * Subscribe in event physical activity save
                 */
                const activitySaveEvent = new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date())
                const activityEventSaveHandler = new PhysicalActivitySaveEventHandler(
                    this._diContainer.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY), this._logger)
                this._eventBus
                    .subscribe(activitySaveEvent, activityEventSaveHandler, 'activities.save')
                    .then((result: boolean) => {
                        if (result) this._logger.info('Subscribe in PhysicalActivitySaveEvent successful!')
                    })
                    .catch(err => {
                        this._logger.error(`Error in Subscribe PhysicalActivitySaveEvent! ${err.message}`)
                    })

                /**
                 * Subscribe in event sleep save
                 */
                const sleepSaveEvent = new SleepSaveEvent('SleepSaveEvent', new Date())
                const sleepEventSaveHandler = new SleepSaveEventHandler(
                    this._diContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY), this._logger)
                this._eventBus
                    .subscribe(sleepSaveEvent, sleepEventSaveHandler, 'sleep.save')
                    .then((result: boolean) => {
                        if (result) this._logger.info('Subscribe in SleepSaveEventHandler successful!')
                    })
                    .catch(err => {
                        this._logger.error(`Error in Subscribe SleepSaveEventHandler! ${err.message}`)
                    })

                /**
                 * Subscribe in event environment save
                 */
                const environmentSaveEvent = new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date())
                const environmentSaveEventHandler = new EnvironmentSaveEventHandler(
                    this._diContainer.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), this._logger)
                this._eventBus
                    .subscribe(environmentSaveEvent, environmentSaveEventHandler, 'environments.save')
                    .then((result: boolean) => {
                        if (result) this._logger.info('Subscribe in EnvironmentSaveEvent successful!')
                    })
                    .catch(err => {
                        this._logger.error(`Error in Subscribe EnvironmentSaveEvent! ${err.message}`)
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
            .then(() => {
                this._logger.info('Connection to publish established successfully!')

                setInterval(this.internalPublishSavedEvents, 300000, // 5min
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
            const physicalActivitySaveEvent: PhysicalActivitySaveEvent = new PhysicalActivitySaveEvent(
                event.event_name,
                event.timestamp,
                new PhysicalActivity().fromJSON(event.physicalactivity)
            )
            return eventBus.publish(physicalActivitySaveEvent, event.__routing_key)
        } else if (event.event_name === 'SleepSaveEvent') {
            const sleepSaveEvent: SleepSaveEvent = new SleepSaveEvent(
                event.event_name,
                event.timestamp,
                new Sleep().fromJSON(event.sleep)
            )
            return eventBus.publish(sleepSaveEvent, event.__routing_key)
        } else if (event.event_name === 'EnvironmentSaveEvent') {
            const environmentSaveEvent: EnvironmentSaveEvent = new EnvironmentSaveEvent(
                event.event_name,
                event.timestamp,
                new Environment().fromJSON(event.environment)
            )
            return eventBus.publish(environmentSaveEvent, event.__routing_key)
        }

        return Promise.resolve(false)
    }
}
