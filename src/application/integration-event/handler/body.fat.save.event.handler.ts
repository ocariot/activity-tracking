import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { BodyFatEvent } from '../event/body.fat.event'
import { IBodyFatRepository } from '../../port/body.fat.repository.interface'
import { BodyFat } from '../../domain/model/body.fat'
import { CreateBodyFatValidator } from '../../domain/validator/create.body.fat.validator'

export class BodyFatSaveEventHandler implements IIntegrationEventHandler<BodyFatEvent> {
    private count: number = 0

    /**
     * Creates an instance of BodyFatSaveEventHandler.
     *
     * @param _fatRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.BODY_FAT_REPOSITORY) private readonly _fatRepository: IBodyFatRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: BodyFatEvent): Promise<void> {
        try {
            // 1. Convert json body_fat to object.
            const fat: BodyFat = new BodyFat().fromJSON(event.body_fat)

            // 2. Validate object based on create action.
            CreateBodyFatValidator.validate(fat)

            // 3. Checks whether the object already has a record.
            // If it exists, an exception of type ConflictException is thrown.
            const fatExist = await this._fatRepository.checkExist(fat)
            if (fatExist) throw new ConflictException('BodyFat is already registered...')

            // 4. Try to save the body_fat.
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
