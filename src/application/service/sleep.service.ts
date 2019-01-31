import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { ISleepService } from '../port/sleep.service.interface'
import { ISleepRepository } from '../port/sleep.repository.interface'
import { Sleep } from '../domain/model/sleep'
import { CreateSleepValidator } from '../domain/validator/create.sleep.validator'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { SleepSaveEvent } from '../integration-event/event/sleep.save.event'

/**
 * Implementing sleep Service.
 *
 * @implements {ISleepService}
 */
@injectable()
export class SleepService implements ISleepService {

    constructor(@inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly eventBus: IEventBus,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    /**
     * Adds a new sleep.
     * Before adding, it is checked whether the sleep already exists.
     *
     * @param {Sleep} sleep
     * @returns {(Promise<Sleep>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing sleep.
     */
    public async add(sleep: Sleep): Promise<Sleep> {
        CreateSleepValidator.validate(sleep)
        const sleepExist = await this._sleepRepository.checkExist(sleep)
        if (sleepExist) throw new ConflictException('Sleep is already registered...')

        try {
            const sleepSaved: Sleep = await this._sleepRepository.create(sleep)

            this.logger.info(`Sleep with ID: ${sleepSaved.id} published on event bus...`)
            this.eventBus.publish(
                new SleepSaveEvent('SleepSaveEvent', new Date(), sleepSaved),
                'sleep.save'
            )
            return Promise.resolve(sleepSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all sleep in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Sleep>> {
        return this._sleepRepository.find(query)
    }

    /**
     * Get in infrastructure the sleep data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<Sleep> {
        query.filters = { _id: id }
        return this._sleepRepository.findOne(query)
    }

    /**
     * Retrieve sleep by unique identifier (ID) and child ID.
     *
     * @param sleepId Sleep unique identifier.
     * @param userId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(sleepId: string, userId: string, query: IQuery): Promise<Sleep> {
        query.filters = { _id: sleepId, child_id: userId }
        return this._sleepRepository.findOne(query)
    }

    /**
     * List the sleep of a child.
     *
     * @param userId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(userId: string, query: IQuery): Promise<Array<Sleep>> {
        query.addFilter({ child_id: userId })
        return this._sleepRepository.find(query)
    }

    /**
     * Update child sleep data.
     *
     * @param sleep Containing the data to be updated
     * @param userId Child unique identifier.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(sleep: Sleep, userId: string): Promise<Sleep> {
        return this._sleepRepository.updateByChild(sleep, userId)
    }

    /**
     * Remove sleep according to its unique identifier and related child.
     *
     * @param sleepId Unique identifier.
     * @param userId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(sleepId: string | number, userId: string): Promise<boolean> {
        return this._sleepRepository.removeByChild(sleepId, userId)
    }

    public async update(sleep: Sleep): Promise<Sleep> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
