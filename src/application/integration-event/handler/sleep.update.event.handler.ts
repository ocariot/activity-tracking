import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { Sleep } from '../../domain/model/sleep'
import { ValidationException } from '../../domain/exception/validation.exception'
import { ISleepService } from '../../port/sleep.service.interface'

/**
 * Handler for SleepUpdateEvent operation.
 *
 * @param event
 */
export const sleepUpdateEventHandler = async (event: any) => {
    const sleepService: ISleepService = DIContainer.get<ISleepService>(Identifier.SLEEP_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.sleep) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        // 1. Convert sleep json to object.
        const sleep: Sleep = new Sleep().fromJSON(event.sleep)
        sleep.isFromEventBus = true

        // 2. Try to update the sleep.
        await sleepService.updateByChild(sleep)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
