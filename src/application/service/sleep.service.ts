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
import { UpdateSleepValidator } from '../domain/validator/update.sleep.validator'
import { UuidValidator } from '../domain/validator/uuid.validator'
import { Strings } from '../../utils/strings'

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
        try {
            // 1. Validate the object.
            CreateSleepValidator.validate(sleep)

            // 2. Checks if sleep already exists.
            const sleepExist = await this._sleepRepository.checkExist(sleep)
            if (sleepExist) throw new ConflictException('Sleep is already registered...')

            // 3. Create new sleep register.
            const sleepSaved: Sleep = await this._sleepRepository.create(sleep)

            // 4. If created successfully, the object is published on the message bus.
            if (sleepSaved) {
                this.logger.info(`Sleep with ID: ${sleepSaved.id} published on event bus...`)
                this.eventBus.publish(
                    new SleepSaveEvent('SleepSaveEvent', new Date(), sleepSaved),
                    'sleep.save'
                )
            }
            // 5. Returns the created object.
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
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve sleep by unique identifier (ID) and child ID.
     *
     * @param sleepId Sleep unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(sleepId: string, childId: string, query: IQuery): Promise<Sleep> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        UuidValidator.validate(sleepId, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ _id: sleepId, child_id: childId })
        return this._sleepRepository.findOne(query)
    }

    /**
     * List the sleep of a child.
     *
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(childId: string, query: IQuery): Promise<Array<Sleep>> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ child_id: childId })
        return this._sleepRepository.find(query)
    }

    /**
     * Update child sleep data.
     *
     * @param sleep Containing the data to be updated
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(sleep: Sleep): Promise<Sleep> {
        UpdateSleepValidator.validate(sleep)
        return this._sleepRepository.updateByChild(sleep)
    }

    /**
     * Remove sleep according to its unique identifier and related child.
     *
     * @param sleepId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(sleepId: string, childId: string): Promise<boolean> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        UuidValidator.validate(sleepId, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)

        return this._sleepRepository.removeByChild(sleepId, childId)
    }

    public async update(sleep: Sleep): Promise<Sleep> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
