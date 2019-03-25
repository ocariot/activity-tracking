import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { EnvironmentEvent } from '../event/environment.event'
import { IEnvironmentRepository } from '../../port/environment.repository.interface'
import { CreateEnvironmentValidator } from '../../domain/validator/create.environment.validator'
import { Environment } from '../../domain/model/environment'

export class EnvironmentSaveEventHandler implements IIntegrationEventHandler<EnvironmentEvent> {
    private count: number = 0

    /**
     * Creates an instance of EnvironmentSaveEventHandler.
     *
     * @param _environmentRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: EnvironmentEvent): Promise<void> {
        try {
            // 1. Convert json environment to object.
            const environment: Environment = await new Environment().fromJSON(event.environment)

            // 2. Validate object based on create action.
            CreateEnvironmentValidator.validate(environment)

            // 3. Checks whether the object already has a record.
            // If it exists, an exception of type ConflictException is thrown.
            const environmentExist = await this._environmentRepository.checkExist(environment)
            if (environmentExist) throw new ConflictException('Environment is already registered...')

            // 4. Try to save the environment.
            // Exceptions of type RepositoryException and ValidationException can be triggered.
            await this._environmentRepository.create(environment)

            // 5. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
