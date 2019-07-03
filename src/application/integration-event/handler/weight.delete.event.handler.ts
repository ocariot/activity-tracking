import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'
import { WeightEvent } from '../event/weight.event'
import { IWeightRepository } from '../../port/weight.repository.interface'
import { Weight } from '../../domain/model/weight'

export class WeightDeleteEventHandler implements IIntegrationEventHandler<WeightEvent> {
    private count: number = 0

    /**
     * Creates an instance of WeightDeleteEventHandler.
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

            // 2. Validate id's
            ObjectIdValidator.validate(weight.child_id!, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(weight.id!, Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)

            // 3. Try to remove the weight.
            await this._weightRepository.removeByChild(weight.id!, weight.child_id!, weight.type!)

            // 4. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
