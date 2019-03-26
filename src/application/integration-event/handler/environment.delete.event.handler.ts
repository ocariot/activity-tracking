import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { EnvironmentEvent } from '../event/environment.event'
import { IEnvironmentRepository } from '../../port/environment.repository.interface'
import { Environment } from '../../domain/model/environment'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'

export class EnvironmentDeleteEventHandler implements IIntegrationEventHandler<EnvironmentEvent> {
    private count: number = 0

    /**
     * Creates an instance of EnvironmentDeleteEventHandler.
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

            // 2. Validate id parameter.
            ObjectIdValidator.validate(environment.id!, Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)

            // 3. Try to delete the environment.
            await this._environmentRepository.delete(environment.id!)

            // 4. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
