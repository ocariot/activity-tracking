import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'
import { IFatRepository } from '../../port/fat.repository.interface'
import { FatEvent } from '../event/fat.event'
import { Fat } from '../../domain/model/fat'

export class FatDeleteEventHandler implements IIntegrationEventHandler<FatEvent> {
    private count: number = 0

    /**
     * Creates an instance of FatDeleteEventHandler.
     *
     * @param _fatRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.FAT_REPOSITORY) private readonly _fatRepository: IFatRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: FatEvent): Promise<void> {
        try {
            // 1. Convert json fat to object.
            const fat: Fat = new Fat().fromJSON(event.fat)

            // 2. Validate id's
            ObjectIdValidator.validate(fat.child_id!, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(fat.id!, Strings.FAT.PARAM_ID_NOT_VALID_FORMAT)

            // 3. Try to remove the fat.
            await this._fatRepository.removeByChild(fat.id!, fat.child_id!, fat.type!)

            // 4. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
