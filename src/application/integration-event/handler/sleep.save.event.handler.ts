import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { CustomLogger } from '../../../utils/custom.logger'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { Sleep } from '../../domain/model/sleep'
import { CreateSleepValidator } from '../../domain/validator/create.sleep.validator'
import { SleepSaveEvent } from '../event/sleep.save.event'

export class SleepSaveEventHandler implements IIntegrationEventHandler<SleepSaveEvent> {

    /**
     * Creates an instance of SleepSaveEventHandler.
     *
     * @param _sleepRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
    }

    public async handle(event: SleepSaveEvent): Promise<void> {
        const sleep: Sleep = new Sleep().fromJSON(event.sleep)

        try {
            CreateSleepValidator.validate(sleep)
            const sleepExist = await this._sleepRepository.checkExist(sleep)
            if (sleepExist) throw new ConflictException('Sleep is already registered...')

            await this._sleepRepository
                .create(sleep)
                .then((result: Sleep) => {
                    this._logger.info(`Action for event ${event.event_name} successfully held!`)
                })
        } catch (err) {
            this._logger.error(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. `)
                .concat(err.message))
        }
    }
}
