import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { ILogger } from '../utils/custom.logger'
import { EventBusTask } from './task/eventbus.task'
import { DI } from '../di/di'

@injectable()
export class BackgroundService {
    private container: Container

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IDBConnection,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.container = DI.getInstance().getContainer()
    }

    public async startServices(): Promise<void> {

        try {
            // Trying to connect to mongodb.
            // Go ahead only when the run is resolved.
            // Since the application depends on the database connection to work.
            await this._mongodb.tryConnect(0, 1000)

            // Perform task responsible for signature and event publishing routines,
            // which for some reason could not be sent and saved for later submission.
            const eventBusTask: EventBusTask = this.container.get(Identifier.EVENT_BUS_TASK)
            eventBusTask.run()
        } catch (err) {
            this._logger.error(`Error initializing services in background! ${err.message}`)
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._eventBus.dispose()
            await this._mongodb.dispose()
        } catch (err) {
            this._logger.error(`Error stopping background services! ${err.message}`)
        }
    }
}
