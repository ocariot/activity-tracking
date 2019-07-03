import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { WeightEvent } from '../event/weight.event'
import { IWeightRepository } from '../../port/weight.repository.interface'
import { Weight } from '../../domain/model/weight'
import { CreateWeightValidator } from '../../domain/validator/create.weight.validator'

export class WeightSaveEventHandler implements IIntegrationEventHandler<WeightEvent> {
    private count: number = 0

    /**
     * Creates an instance of WeightSaveEventHandler.
     *
     * @param _weightRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.WEIGHT_REPOSITORY) private readonly _weightRepository: IWeightRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: WeightEvent): Promise<void> {
        try {
            // 1. Convert json weight to object.
            const weight: Weight = new Weight().fromJSON(event.weight)

            // 2. Validate object based on create action.
            CreateWeightValidator.validate(weight)

            // 3. Checks whether the object already has a record.
            // If it exists, an exception of type ConflictException is thrown.
            const weightExist = await this._weightRepository.checkExist(weight)
            if (weightExist) throw new ConflictException('Weight is already registered...')

            // 4. Try to save the weight.
            // Exceptions of type RepositoryException and ValidationException can be triggered.
            await this._weightRepository.create(weight)

            // 5. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
