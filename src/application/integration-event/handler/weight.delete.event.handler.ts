import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { IWeightRepository } from '../../port/weight.repository.interface'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for WeightDeleteEvent operation.
 *
 * @param event
 */
export const weightDeleteEventHandler = async (event: any) => {
    const weightRepository: IWeightRepository = DIContainer.get<IWeightRepository>(Identifier.WEIGHT_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.weight && (!event.weight.id || !event.weight.child_id)) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const weightId: string = event.weight.id
        const childId: string = event.weight.child_id
        const type: string = event.weight.type

        // 1. Validate id's
        ObjectIdValidator.validate(weightId, Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Try to remove the weight.
        await weightRepository.removeByChild(weightId, childId, type)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
