import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { EventBusTask } from './task/eventbus.task'
import { DI } from '../di/di'

@injectable()
export class BackgroundService {
    private container: Container
    private eventBusTask: EventBusTask

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IDBConnection
    ) {
        this.container = DI.getInstance().getContainer()
        this.eventBusTask = this.container.get<EventBusTask>(Identifier.EVENT_BUS_TASK)
    }

    public async startServices(): Promise<void> {
        try {
            // Trying to connect to mongodb.
            // Go ahead only when the run is resolved.
            // Since the application depends on the database connection to work.
            await this._mongodb.tryConnect(0, 1000)

            // Perform task responsible for signature and event publishing routines,
            // which for some reason could not be sent and saved for later submission.
            this.eventBusTask.run()
        } catch (err) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._mongodb.dispose()
            await this.eventBusTask.stop()
        } catch (err) {
            return Promise.reject(new Error(`Error stopping MongoDB! ${err.message}`))
        }
    }
}
