import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { IBodyFatRepository } from '../../port/body.fat.repository.interface'
import { IWeightRepository } from '../../port/weight.repository.interface'
import { DIContainer } from '../../../di/di'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for UserDeleteEvent operation.
 * Every operation must be within the function!
 *
 * @param event
 */
export const userDeleteEventHandler = async (event: any) => {
    const activityRepository: IPhysicalActivityRepository = DIContainer
        .get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY)
    const sleepRepository: ISleepRepository = DIContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
    const weightRepository: IWeightRepository = DIContainer.get<IWeightRepository>(Identifier.WEIGHT_REPOSITORY)
    const bodyFatRepository: IBodyFatRepository = DIContainer.get<IBodyFatRepository>(Identifier.BODY_FAT_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.user && !event.user.id) {
            throw new ValidationException('Event received but could not be continued due to an error in the event format.')
        }
        const childId: string = event.user.id!

        // Validate childId.
        ObjectIdValidator.validate(childId)

        // 1a. Try to delete all the activities associated with thi logger.errors user.
        await activityRepository.removeAllActivitiesFromChild(childId)

        // 1b. Try to delete all the sleep objects associated with this user.
        await sleepRepository.removeAllSleepFromChild(childId)

        // 1c. Try to delete all the bodyfat objects associated with this user.
        await bodyFatRepository.removeAllBodyFatFromChild(childId)

        // 1d. Try to delete all the weight objects associated with this user.
        await weightRepository.removeAllWeightFromChild(childId)

        // TODO Remove logs must be implemented!!!

        // 2. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
