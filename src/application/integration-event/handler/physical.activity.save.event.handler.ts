import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { PhysicalActivitySaveEvent } from '../event/physical.activity.save.event'
import { PhysicalActivity } from '../../domain/model/physical.activity'
import { CustomLogger } from '../../../utils/custom.logger'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { CreatePhysicalActivityValidator } from '../../domain/validator/create.physical.activity.validator'
import { ConflictException } from '../../domain/exception/conflict.exception'

export class PhysicalActivitySaveEventHandler implements IIntegrationEventHandler<PhysicalActivitySaveEvent> {

    /**
     * Creates an instance of ActivitySaveEventHandler.
     *
     * @param _activityRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
    }

    public async handle(event: PhysicalActivitySaveEvent): Promise<void> {
        const activity: PhysicalActivity = new PhysicalActivity().fromJSON(event.physicalactivity)
        try {
            CreatePhysicalActivityValidator.validate(activity)
            const activityExist = await this._activityRepository.checkExist(activity)
            if (activityExist) throw new ConflictException('Physical Activity is already registered...')

            await this._activityRepository
                .create(activity)
                .then((result: PhysicalActivity) => {
                    this._logger.info(`Action for event ${event.event_name} successfully held!`)
                })
        } catch (err) {
            this._logger.error(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. `)
                .concat(err.message))
        }
    }
}
