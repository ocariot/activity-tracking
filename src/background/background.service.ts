import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { CustomLogger } from '../utils/custom.logger'
import { PhysicalActivitySaveEventHandler } from '../application/integration-event/handler/physical.activity.save.event.handler'
import { DI } from '../di/di'
import { PhysicalActivitySaveEvent } from '../application/integration-event/event/physical.activity.save.event'
import { IPhysicalActivityRepository } from '../application/port/physical.activity.repository.interface'
import { ISleepRepository } from '../application/port/sleep.repository.interface'
import { EnvironmentSaveEvent } from '../application/integration-event/event/environment.save.event'
import { SleepSaveEvent } from '../application/integration-event/event/sleep.save.event'
import { SleepSaveEventHandler } from '../application/integration-event/handler/sleep.save.event.handler'
import { EnvironmentSaveEventHandler } from '../application/integration-event/handler/environment.save.event.handler'
import { IEnvironmentRepository } from '../application/port/environment.repository.interface'

@injectable()
export class BackgroundService {
    private readonly _diContainer: Container

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IDBConnection,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
        this._diContainer = DI.getInstance().getContainer()
    }

    public async startServices(): Promise<void> {
        this._logger.debug('startServices()')
        try {
            await this._mongodb.tryConnect() // Initialize mongodb

            /**
             * Subscribe in event physical activity save
             */
            const activitySaveEvent = new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date())
            const activityEventSaveHandler = new PhysicalActivitySaveEventHandler(
                this._diContainer.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY), this._logger)
            await this._eventBus.subscribe(activitySaveEvent, activityEventSaveHandler, 'activities.save')

            /**
             * Subscribe in event sleep save
             */
            const sleepSaveEvent = new SleepSaveEvent('SleepSaveEvent', new Date())
            const sleepEventSaveHandler = new SleepSaveEventHandler(
                this._diContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY), this._logger)
            await this._eventBus.subscribe(sleepSaveEvent, sleepEventSaveHandler, 'sleep.save')

            /**
             * Subscribe in event environment save
             */
            const environmentSaveEvent = new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date())
            const environmentSaveEventHandler = new EnvironmentSaveEventHandler(
                this._diContainer.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), this._logger)
            await this._eventBus.subscribe(environmentSaveEvent, environmentSaveEventHandler, 'environments.save')
        } catch (err) {
            this._logger.error('Error initializing services in background: '.concat(err.message))
        }
    }

    public async stopServices(): Promise<void> {
        this._logger.debug('stopServices()')
        try {
            await this._eventBus.dispose()
            await this._mongodb.dispose()
        } catch (err) {
            this._logger.error('Error stopping background services: '.concat(err.message))
        }
    }
}
