import { IBackgroundTask } from '../../application/port/background.task.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import cron from 'cron'
import { Default } from '../../utils/default'
import { Environment } from '../../application/domain/model/environment'

@injectable()
export class NotificationTask implements IBackgroundTask {
    private job: any
    private numberOfDays: number = Number(process.env.NUMBER_OF_DAYS) || Default.NUMBER_OF_DAYS

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.job = new cron.CronJob(`${process.env.EXPRESSION_AUTO_NOTIFICATION || Default.EXPRESSION_AUTO_NOTIFICATION}`,
            () => this.checkInactivity())
    }

    public run(): void {
        this.job.start()
        this._logger.debug('Notification task started successfully!')
    }

    public stop(): Promise<void> {
        this.job.stop()
        return this._eventBus.dispose()
    }

    private sendNotification(environments: Array<Environment>): void {
        try {
            for (const environment of environments) {
                this._logger.info(`Sensor deployed in ${environment.location!.local + ', ' + environment.location!.room} `
                    .concat(`didn't send data in the last ${this.numberOfDays} days.`))
            }
        } catch (err) {
            this._logger.error(`An error occurred while trying to send a notification. ${err.message}`)
        }
    }

    private checkInactivity(): void {
        this._environmentRepository.findByTimestamp(this.numberOfDays)
            .then(result => {
                if (result.length) this.sendNotification(result)
            })
            .catch(err => {
                this._logger.error(`An error occurred while trying to retrieve Environment data. ${err.message}`)
            })
    }
}
