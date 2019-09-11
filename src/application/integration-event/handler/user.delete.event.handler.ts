import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { IPhysicalActivityRepository } from '../../port/physical.activity.repository.interface'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { IBodyFatRepository } from '../../port/body.fat.repository.interface'
import { IWeightRepository } from '../../port/weight.repository.interface'
import { DIContainer } from '../../../di/di'
import { ValidationException } from '../../domain/exception/validation.exception'
import { ILogRepository } from '../../port/log.repository.interface'

/**
 * Handler for UserDeleteEvent operation.
 *
 * @param event
 */
export const userDeleteEventHandler = async (event: any) => {
    const activityRepository: IPhysicalActivityRepository = DIContainer
        .get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY)
    const sleepRepository: ISleepRepository = DIContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
    const weightRepository: IWeightRepository = DIContainer.get<IWeightRepository>(Identifier.WEIGHT_REPOSITORY)
    const bodyFatRepository: IBodyFatRepository = DIContainer.get<IBodyFatRepository>(Identifier.BODY_FAT_REPOSITORY)
    const logRepository: ILogRepository = DIContainer.get<ILogRepository>(Identifier.LOG_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.user && !event.user.id) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const childId: string = event.user.id

        // 1. Validate childId.
        ObjectIdValidator.validate(childId)

        // 2a. Try to delete all activities associated with this user.
        activityRepository.removeAllActivitiesFromChild(childId)
            .then(() => {
                logger.info(`All activities associated with the user with ID: ${childId} have been successfully`
                    .concat(` removed from the database.`))
            })
            .catch((err) => {
                logger.error(`Error trying to remove all activities from child. ${err.message}`)
            })

        // 2b. Try to delete all sleep objects associated with this user.
        sleepRepository.removeAllSleepFromChild(childId)
            .then(() => {
                logger.info(`All sleep objects associated with the user with ID: ${childId} have been successfully`
                    .concat(` removed from the database.`))
            })
            .catch((err) => {
                logger.error(`Error trying to remove all sleep objects from child. ${err.message}`)
            })

        // 2c. Try to delete all bodyfat objects associated with this user.
        bodyFatRepository.removeAllBodyFatFromChild(childId)
            .then(() => {
                logger.info(`All body fat objects associated with the user with ID: ${childId} have been successfully`
                    .concat(` removed from the database.`))
            })
            .catch((err) => {
                logger.error(`Error trying to remove all body fats from child. ${err.message}`)
            })

        // 2d. Try to delete all weight objects associated with this user.
        weightRepository.removeAllWeightFromChild(childId)
            .then(() => {
                logger.info(`All weight objects associated with the user with ID: ${childId} have been successfully`
                    .concat(` removed from the database.`))
            })
            .catch((err) => {
                logger.error(`Error trying to remove all weights from child. ${err.message}`)
            })

        // 2e. Try to delete all logs associated with this user.
        logRepository.removeAllLogsFromChild(childId)
            .then(() => {
                logger.info(`All logs associated with the user with ID: ${childId} have been successfully`
                    .concat(` removed from the database.`))
            })
            .catch((err) => {
                logger.error(`Error trying to remove all logs from child. ${err.message}`)
            })

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
