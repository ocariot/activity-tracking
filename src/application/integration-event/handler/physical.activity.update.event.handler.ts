import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { PhysicalActivity } from '../../domain/model/physical.activity'
import { ValidationException } from '../../domain/exception/validation.exception'
import { IPhysicalActivityService } from '../../port/physical.activity.service.interface'

/**
 * Handler for PhysicalActivityUpdateEvent operation.
 *
 * @param event
 */
export const physicalActivityUpdateEventHandler = async (event: any) => {
    const activityService: IPhysicalActivityService = DIContainer.get<IPhysicalActivityService>(Identifier.ACTIVITY_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.physicalactivity) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        // 1. Convert json physical activity to object.
        const activity: PhysicalActivity = new PhysicalActivity().fromJSON(event.physicalactivity)
        activity.isFromEventBus = true

        // 2. Try to update activity.
        await activityService.updateByChild(activity)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
