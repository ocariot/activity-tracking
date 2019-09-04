import { inject, injectable } from 'inversify'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { userDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { ILogger } from '../../utils/custom.logger'
import { environmentDeleteEventHandler } from '../../application/integration-event/handler/environment.delete.event.handler'
import { environmentSaveEventHandler } from '../../application/integration-event/handler/environment.save.event.handler'
import { institutionDeleteEventHandler } from '../../application/integration-event/handler/institution.delete.event.handler'
import { physicalActivityDeleteEventHandler } from '../../application/integration-event/handler/physical.activity.delete.event.handler'
import { physicalActivitySaveEventHandler } from '../../application/integration-event/handler/physical.activity.save.event.handler'
import { physicalActivityUpdateEventHandler } from '../../application/integration-event/handler/physical.activity.update.event.handler'
import { sleepDeleteEventHandler } from '../../application/integration-event/handler/sleep.delete.event.handler'
import { sleepSaveEventHandler } from '../../application/integration-event/handler/sleep.save.event.handler'
import { sleepUpdateEventHandler } from '../../application/integration-event/handler/sleep.update.event.handler'
import { weightDeleteEventHandler } from '../../application/integration-event/handler/weight.delete.event.handler'
import { weightSaveEventHandler } from '../../application/integration-event/handler/weight.save.event.handler'

@injectable()
export class SubscribeEventBusTask implements IBackgroundTask {

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeSubscribe()
    }

    public stop(): Promise<void> {
        return this._eventBus.dispose()
    }

    /**
     * Subscribe for all events.
     */
    private initializeSubscribe(): void {
        this._eventBus.bus
            .subDeleteEnvironment(environmentDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in EnvironmentDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to EnvironmentDeleteEvent: ${err.message}`))
        this._eventBus.bus
            .subSaveEnvironment(environmentSaveEventHandler)
            .then(() => this._logger.info('Subscribe in EnvironmentSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to EnvironmentSaveEvent: ${err.message}`))

        this._eventBus.bus
            .subDeleteInstitution(institutionDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in InstitutionDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to InstitutionDeleteEvent: ${err.message}`))

        this._eventBus.bus
            .subDeletePhysicalActivity(physicalActivityDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in PhysicalActivityDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to PhysicalActivityDeleteEvent: ${err.message}`))
        this._eventBus.bus
            .subSavePhysicalActivity(physicalActivitySaveEventHandler)
            .then(() => this._logger.info('Subscribe in PhysicalActivitySaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to PhysicalActivitySaveEvent: ${err.message}`))
        this._eventBus.bus
            .subUpdatePhysicalActivity(physicalActivityUpdateEventHandler)
            .then(() => this._logger.info('Subscribe in PhysicalActivityUpdateEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to PhysicalActivityUpdateEvent: ${err.message}`))

        this._eventBus.bus
            .subDeleteSleep(sleepDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in SleepDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to SleepDeleteEvent: ${err.message}`))
        this._eventBus.bus
            .subSaveSleep(sleepSaveEventHandler)
            .then(() => this._logger.info('Subscribe in SleepSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to SleepSaveEvent: ${err.message}`))
        this._eventBus.bus
            .subUpdateSleep(sleepUpdateEventHandler)
            .then(() => this._logger.info('Subscribe in SleepUpdateEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to SleepUpdateEvent: ${err.message}`))

        this._eventBus.bus
            .subDeleteUser(userDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in UserDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to UserDeleteEvent: ${err.message}`))

        this._eventBus.bus
            .subDeleteWeight(weightDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in WeightDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to WeightDeleteEvent: ${err.message}`))
        this._eventBus.bus
            .subSaveWeight(weightSaveEventHandler)
            .then(() => this._logger.info('Subscribe in WeightSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to WeightSaveEvent: ${err.message}`))
    }
}
