import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { Weight } from '../../domain/model/weight'
import { ValidationException } from '../../domain/exception/validation.exception'
import { IWeightService } from '../../port/weight.service.interface'

/**
 * Handler for WeightSaveEvent operation.
 *
 * @param event
 */
export const weightSaveEventHandler = async (event: any) => {
    const weightService: IWeightService = DIContainer.get<IWeightService>(Identifier.WEIGHT_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.weight) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        if (event.weight instanceof Array) {
            // 1. Convert weight array json to object.
            const weightArr: Array<Weight> = event.weight.map(item => {
                const weightItem: Weight = new Weight().fromJSON(item)
                weightItem.isFromEventBus = true
                return weightItem
            })

            // 2. Try to add weight objects
            weightService.add(weightArr)
                .then(result => {
                    logger.info(`Action for event ${event.event_name} associated with child with ID: `
                        .concat(`${weightArr[0].child_id} successfully held! Total successful items: `)
                        .concat(`${result.success.length} / Total items with error: ${result.error.length}`))
                })
                .catch((err) => {
                    throw err
                })
        }
        else {
            // 1. Convert weight json to object.
            const weight: Weight = new Weight().fromJSON(event.weight)
            weight.isFromEventBus = true

            // 2. Try to add the weight
            await weightService.add(weight)
            logger.info(`Action for event ${event.event_name} associated with child with ID: ${weight.child_id} successfully held!`)
        }
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
