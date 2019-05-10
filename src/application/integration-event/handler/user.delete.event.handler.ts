import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { UserEvent } from '../event/user.event'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'

export class UserDeleteEventHandler implements IIntegrationEventHandler<UserEvent> {
    /**
     * Creates an instance of UserDeleteEventHandler.
     *
     * @param _activityRepository
     * @param _sleepRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
        @inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: UserEvent): Promise<void> {
        try {
            if (!event.user) return Promise.reject()
            const childId: string = event.user.id!

            // Validate childId.
            ObjectIdValidator.validate(childId)

            // 1a. Try to delete all the activities associated with this user.
            await this._activityRepository.removeAllActivitiesFromChild(childId)

            // 1b. Try to delete all the sleep objects associated with this user.
            await this._sleepRepository.removeAllSleepFromChild(childId)

            // 2. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held!`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
