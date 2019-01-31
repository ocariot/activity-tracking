import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { CustomLogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { EnvironmentSaveEvent } from '../event/environment.save.event'
import { IEnvironmentRepository } from '../../port/environment.repository.interface'
import { CreateEnvironmentValidator } from '../../domain/validator/create.environment.validator'
import { Environment } from '../../domain/model/environment'

export class EnvironmentSaveEventHandler implements IIntegrationEventHandler<EnvironmentSaveEvent> {

    /**
     * Creates an instance of EnvironmentSaveEventHandler.
     *
     * @param _environmentRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
    }

    public async handle(event: EnvironmentSaveEvent): Promise<void> {
        const environment: Environment = new Environment().fromJSON(event.environment)

        try {
            CreateEnvironmentValidator.validate(environment)
            const environmentExist = await this._environmentRepository.checkExist(environment)
            if (environmentExist) throw new ConflictException('Environment is already registered...')

            await this._environmentRepository
                .create(environment)
                .then((result: Environment) => {
                    this._logger.info(`Action for event ${event.event_name} successfully held!`)
                })
        } catch (err) {
            this._logger.error(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. `)
                .concat(err.message))
        }
    }
}
