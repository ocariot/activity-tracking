import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'
import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for SleepDeleteEvent operation.
 *
 * @param event
 */
export const sleepDeleteEventHandler = async (event: any) => {
    const sleepRepository: ISleepRepository = DIContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.sleep && (!event.sleep.id || !event.sleep.child_id)) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const sleepId: string = event.sleep.id
        const childId: string = event.sleep.child_id

        // 1. Validate id's
        ObjectIdValidator.validate(sleepId, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Try to delete the sleep.
        await sleepRepository.removeByChild(sleepId, childId)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
