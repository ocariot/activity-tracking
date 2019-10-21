import { inject, injectable } from 'inversify'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { userDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { ILogger } from '../../utils/custom.logger'
import { physicalActivitySyncEventHandler } from '../../application/integration-event/handler/physical.activity.sync.event.handler'
import { sleepSyncEventHandler } from '../../application/integration-event/handler/sleep.sync.event.handler'
import { weightSyncEventHandler } from '../../application/integration-event/handler/weight.sync.event.handler'
import { institutionDeleteEventHandler } from '../../application/integration-event/handler/institution.delete.event.handler'
import { logSyncEventHandler } from '../../application/integration-event/handler/log.sync.event.handler'

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
            .subDeleteUser(userDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in UserDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to UserDeleteEvent: ${err.message}`))

        this._eventBus.bus
            .subDeleteInstitution(institutionDeleteEventHandler)
            .then(() => this._logger.info('Subscribe in InstitutionDeleteEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to InstitutionDeleteEvent: ${err.message}`))

        this._eventBus.bus
            .subSyncPhysicalActivity(physicalActivitySyncEventHandler)
            .then(() => this._logger.info('Subscribe in PhysicalActivitySyncEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to PhysicalActivitySyncEvent: ${err.message}`))

        this._eventBus.bus
            .subSyncSleep(sleepSyncEventHandler)
            .then(() => this._logger.info('Subscribe in SleepSyncEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to SleepSyncEvent: ${err.message}`))

        this._eventBus.bus
            .subSyncWeight(weightSyncEventHandler)
            .then(() => this._logger.info('Subscribe in WeightSyncEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to WeightSyncEvent: ${err.message}`))

        this._eventBus.bus
            .subSyncLog(logSyncEventHandler)
            .then(() => this._logger.info('Subscribe in LogSyncEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to LogSyncEvent: ${err.message}`))
    }
}
