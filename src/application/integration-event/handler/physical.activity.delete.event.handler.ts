import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { Strings } from '../../../utils/strings'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for PhysicalActivityDeleteEvent operation.
 *
 * @param event
 */
export const physicalActivityDeleteEventHandler = async (event: any) => {
    const activityRepository: IPhysicalActivityRepository = DIContainer.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.physicalactivity && (!event.physicalactivity.id || !event.physicalactivity.child_id)) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const activityId: string = event.physicalactivity.id
        const childId: string = event.physicalactivity.child_id

        // 1. Validate id's
        ObjectIdValidator.validate(activityId, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Try to remove the physical activity.
        await activityRepository.removeByChild(activityId, childId)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
