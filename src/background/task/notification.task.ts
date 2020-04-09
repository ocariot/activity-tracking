import { IBackgroundTask } from '../../application/port/background.task.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import cron from 'cron'
import { Environment } from '../../application/domain/model/environment'

@injectable()
export class NotificationTask implements IBackgroundTask {
    private job: any

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger,
        private readonly numberOfDays: number,
        private readonly expression_auto_notification: string
    ) {
        this.job = new cron.CronJob(`${this.expression_auto_notification}`,
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
        for (const environment of environments) {
            this._eventBus.bus.pubSendNotification(this.buildNotification(environment))
                .then(() => {
                    this._logger.info('\'iot:miss_data\' notification sent')
                })
                .catch(err => {
                    this._logger.error(`An error occurred while trying to send a notification about the Environment with ID: `
                        .concat(`${environment.id}. ${err.message}`))
                })
        }
    }

    private buildNotification(environment: Environment): any {
        try {
            const now = new Date()
            const timestamp: Date = environment.timestamp
            const diff = Math.abs(now.getTime() - timestamp.getTime())
            const calc_days_since = Math.trunc(diff / (1000 * 60 * 60 * 24))

            return {
                notification_type: 'iot:miss_data',
                institution_id: environment.id,
                days_since: calc_days_since,
                location: {
                    local: environment.location!.local,
                    room: environment.location!.room
                }
            }
        } catch (err) {
            this._logger.error(`An error occurred while trying to build the notification. ${err.message}`)
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
