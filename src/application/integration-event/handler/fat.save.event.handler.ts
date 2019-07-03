import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { FatEvent } from '../event/fat.event'
import { IFatRepository } from '../../port/fat.repository.interface'
import { Fat } from '../../domain/model/fat'
import { CreateFatValidator } from '../../domain/validator/create.fat.validator'

export class FatSaveEventHandler implements IIntegrationEventHandler<FatEvent> {
    private count: number = 0

    /**
     * Creates an instance of FatSaveEventHandler.
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

            // 2. Validate object based on create action.
            CreateFatValidator.validate(fat)

            // 3. Checks whether the object already has a record.
            // If it exists, an exception of type ConflictException is thrown.
            const fatExist = await this._fatRepository.checkExist(fat)
            if (fatExist) throw new ConflictException('Fat is already registered...')

            // 4. Try to save the fat.
            // Exceptions of type RepositoryException and ValidationException can be triggered.
            await this._fatRepository.create(fat)

            // 5. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
