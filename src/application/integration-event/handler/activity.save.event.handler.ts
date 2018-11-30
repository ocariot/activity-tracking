import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ActivitySaveEvent } from '../event/activity.save.event'
import { Activity } from '../../domain/model/activity'
import { CustomLogger } from '../../../utils/custom.logger'
import { IActivityRepository } from '../../port/activity.repository.interface'
import { ActivityValidator } from '../../domain/validator/activity.validator'
import { ConflictException } from '../../domain/exception/conflict.exception'

export class ActivitySaveEventHandler implements IIntegrationEventHandler<ActivitySaveEvent> {

    /**
     * Creates an instance of ActivityRemoveEventHandler.
     *
     * @param _activityRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IActivityRepository,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
    }

    public async handle(event: ActivitySaveEvent): Promise<void> {
        const activity: Activity = new Activity().deserialize(event.activity)
        try {
            ActivityValidator.validate(activity)
            const activityExist = await this._activityRepository.checkExist(activity)
            if (activityExist) throw new ConflictException('Activity is already registered...')

            await this._activityRepository
                .create(activity)
                .then((result: Activity) => {
                    this._logger.info(`Action for event ${event.event_name} successfully held!`)
                })
        } catch (err) {
            this._logger.error(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. `)
                .concat(err.message))
        }
    }
}
