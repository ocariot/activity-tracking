import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { PhysicalActivity } from '../../domain/model/physical.activity'
import { ValidationException } from '../../domain/exception/validation.exception'
import { IPhysicalActivityService } from '../../port/physical.activity.service.interface'

/**
 * Handler for PhysicalActivitySyncEvent operation.
 *
 * @param event
 */
export const physicalActivitySyncEventHandler = async (event: any) => {
    const activityService: IPhysicalActivityService = DIContainer.get<IPhysicalActivityService>(Identifier.ACTIVITY_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.physicalactivity) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        if (event.physicalactivity instanceof Array) {
            // 1. Convert physical activity array json to object.
            const activitiesArr: Array<PhysicalActivity> = event.physicalactivity.map(item => {
                const activityItem: PhysicalActivity = new PhysicalActivity().fromJSON(item)
                return activityItem
            })

            // 2. Try to add activities
            activityService.add(activitiesArr)
                .then(result => {
                    logger.info(`Action for event ${event.event_name} associated with child with ID: `
                        .concat(`${activitiesArr[0].child_id} successfully held! Total successful items: `)
                        .concat(`${result.success.length} / Total items with error: ${result.error.length}`))
                })
                .catch((err) => {
                    throw err
                })
        }
        else {
            // 1. Convert physical activity json to object.
            const activity: PhysicalActivity = new PhysicalActivity().fromJSON(event.physicalactivity)

            // 2. Try to add the activity
            await activityService.add(activity)
            logger.info(`Action for event ${event.event_name} associated with child with ID: ${activity.child_id} successfully held!`)
        }
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
