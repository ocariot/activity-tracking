import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { ISleepRepository } from '../../port/sleep.repository.interface'
import { Sleep } from '../../domain/model/sleep'
import { SleepEvent } from '../event/sleep.event'
import { UpdateSleepValidator } from '../../domain/validator/update.sleep.validator'

export class SleepUpdateEventHandler implements IIntegrationEventHandler<SleepEvent> {
    private count: number = 0

    /**
     * Creates an instance of SleepUpdateEventHandler.
     *
     * @param _sleepRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: SleepEvent): Promise<void> {
        try {
            // 1. Convert json sleep to object.
            const sleep: Sleep = new Sleep().fromJSON(event.sleep)

            // 2. Validate the object.
            UpdateSleepValidator.validate(sleep)

            // 3. Try to update the sleep.
            await this._sleepRepository.updateByChild(sleep)

            // 4. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
