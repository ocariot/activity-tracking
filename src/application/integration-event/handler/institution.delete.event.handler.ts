import { IEnvironmentRepository } from '../../port/environment.repository.interface'
import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ValidationException } from '../../domain/exception/validation.exception'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'

/**
 * Handler for InstitutionDeleteEvent operation.
 *
 * @param event
 */
export const institutionDeleteEventHandler = async (event: any) => {
    const environmentRepository: IEnvironmentRepository = DIContainer.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.institution && !event.institution.id) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const institutionId: string = event.institution.id

        // 1. Validate institutionId.
        ObjectIdValidator.validate(institutionId)

        // 2. Try to delete all the environments associated with this institution.
        await environmentRepository.removeAllEnvironmentsFromInstitution(institutionId)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
