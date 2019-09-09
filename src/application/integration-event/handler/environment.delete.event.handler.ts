import { IEnvironmentRepository } from '../../port/environment.repository.interface'
import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for EnvironmentDeleteEvent operation.
 *
 * @param event
 */
export const environmentDeleteEventHandler = async (event: any) => {
    const environmentRepository: IEnvironmentRepository = DIContainer.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.environment && !event.environment.id) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const environmentId: string = event.environment.id

        // 1. Validate id parameter.
        ObjectIdValidator.validate(environmentId, Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Try to delete the environment.
        await environmentRepository.delete(environmentId)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
