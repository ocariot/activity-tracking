import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { Sleep } from '../../domain/model/sleep'
import { ValidationException } from '../../domain/exception/validation.exception'
import { ISleepService } from '../../port/sleep.service.interface'

/**
 * Handler for SleepSaveEvent operation.
 *
 * @param event
 */
export const sleepSaveEventHandler = async (event: any) => {
    const sleepService: ISleepService = DIContainer.get<ISleepService>(Identifier.SLEEP_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.sleep) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        if (event.sleep instanceof Array) {
            // 1. Convert sleep array json to object.
            const sleepArr: Array<Sleep> = event.sleep.map(item => {
                const sleepItem: Sleep = new Sleep().fromJSON(item)
                sleepItem.isFromEventBus = true
                return sleepItem
            })

            // 2. Try to add sleep objects
            sleepService.add(sleepArr)
                .then(result => {
                    logger.info(`Action for event ${event.event_name} associated with child with ID: `
                        .concat(`${sleepArr[0].child_id} successfully held! Total successful items: `)
                        .concat(`${result.success.length} / Total items with error: ${result.error.length}`))
                })
                .catch((err) => {
                    throw err
                })
        }
        else {
            // 1. Convert sleep json to object.
            const sleep: Sleep = new Sleep().fromJSON(event.sleep)
            sleep.isFromEventBus = true

            // 2. Try to add the sleep
            await sleepService.add(sleep)
            logger.info(`Action for event ${event.event_name} associated with child with ID: ${sleep.child_id} successfully held!`)
        }
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
