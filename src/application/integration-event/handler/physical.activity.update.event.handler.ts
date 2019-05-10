import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { PhysicalActivityEvent } from '../event/physical.activity.event'
import { PhysicalActivity } from '../../domain/model/physical.activity'
import { ILogger } from '../../../utils/custom.logger'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { UpdatePhysicalActivityValidator } from '../../domain/validator/update.physical.activity.validator'

export class PhysicalActivityUpdateEventHandler implements IIntegrationEventHandler<PhysicalActivityEvent> {
    private count: number = 0

    /**
     * Creates an instance of PhysicalActivityUpdateEventHandler.
     *
     * @param _activityRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: PhysicalActivityEvent): Promise<void> {
        try {
            // 1. Convert json physical activity to object.
            const activity: PhysicalActivity = new PhysicalActivity().fromJSON(event.physicalactivity)

            // 2. Validate object.
            UpdatePhysicalActivityValidator.validate(activity)

            // 3. Try to update the physical activity.
            // Exceptions of type RepositoryException and ValidationException can be triggered.
            await this._activityRepository.updateByChild(activity)

            // 4. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
