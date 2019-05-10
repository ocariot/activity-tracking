import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { InstitutionEvent } from '../event/institution.event'
import { IEnvironmentRepository } from '../../port/environment.repository.interface'

export class InstitutionDeleteEventHandler implements IIntegrationEventHandler<InstitutionEvent> {
    /**
     * Creates an instance of InstitutionDeleteEventHandler.
     *
     * @param _environmentRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: InstitutionEvent): Promise<void> {
        try {
            if (!event.institution || !event.institution.id) return Promise.reject()
            const institutionId: string = event.institution.id

            // Validate childId.
            ObjectIdValidator.validate(institutionId)

            // 1a. Try to delete all the environments associated with this institution.
            await this._environmentRepository.removeAllEnvironmentsFromInstitution(institutionId)

            // 2. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held!`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
