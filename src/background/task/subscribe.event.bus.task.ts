import { inject, injectable } from 'inversify'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { userDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { ILogger } from '../../utils/custom.logger'
import { physicalActivitySaveEventHandler } from '../../application/integration-event/handler/physical.activity.save.event.handler'
import { sleepSaveEventHandler } from '../../application/integration-event/handler/sleep.save.event.handler'
import { weightSaveEventHandler } from '../../application/integration-event/handler/weight.save.event.handler'
import { institutionDeleteEventHandler } from '../../application/integration-event/handler/institution.delete.event.handler'
import { logSaveEventHandler } from '../../application/integration-event/handler/log.save.event.handler'

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
            .subSavePhysicalActivity(physicalActivitySaveEventHandler)
            .then(() => this._logger.info('Subscribe in PhysicalActivitySaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to PhysicalActivitySaveEvent: ${err.message}`))

        this._eventBus.bus
            .subSaveSleep(sleepSaveEventHandler)
            .then(() => this._logger.info('Subscribe in SleepSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to SleepSaveEvent: ${err.message}`))

        this._eventBus.bus
            .subSaveWeight(weightSaveEventHandler)
            .then(() => this._logger.info('Subscribe in WeightSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to WeightSaveEvent: ${err.message}`))

        this._eventBus.bus
            .subSaveLog(logSaveEventHandler)
            .then(() => this._logger.info('Subscribe in LogSaveEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to LogSaveEvent: ${err.message}`))
    }
}
