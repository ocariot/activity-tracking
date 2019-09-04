import { ISleepRepository } from '../../port/sleep.repository.interface'
import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { Sleep } from '../../domain/model/sleep'
import { UpdateSleepValidator } from '../../domain/validator/update.sleep.validator'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { Strings } from '../../../utils/strings'
import { ValidationException } from '../../domain/exception/validation.exception'

// TODO Reimplement the logic
/**
 * Handler for SleepUpdateEvent operation.
 *
 * @param event
 */
export const sleepUpdateEventHandler = async (event: any) => {
    const sleepRepository: ISleepRepository = DIContainer.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.sleep) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        // 1. Convert json sleep to object.
        const sleep: Sleep = new Sleep().fromJSON(event.sleep)

        // 2. Validate the object.
        UpdateSleepValidator.validate(sleep)

        // 3. Checks if sleep already exists.
        const sleepExist = await sleepRepository.checkExist(sleep)
        if (sleepExist) throw new ConflictException(Strings.SLEEP.ALREADY_REGISTERED)

        // 4. Update the sleep.
        await sleepRepository.updateByChild(sleep)

        // 5. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
