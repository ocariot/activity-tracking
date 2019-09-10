import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { ISleepService } from '../port/sleep.service.interface'
import { ISleepRepository } from '../port/sleep.repository.interface'
import { Sleep } from '../domain/model/sleep'
import { CreateSleepValidator } from '../domain/validator/create.sleep.validator'
import { UpdateSleepValidator } from '../domain/validator/update.sleep.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing sleep Service.
 *
 * @implements {ISleepService}
 */
@injectable()
export class SleepService implements ISleepService {

    constructor(@inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    /**
     * Adds a new sleep or a list of Sleep.
     * Before adding, it is checked whether the sleep already exists.
     *
     * @param {Sleep | Array<Sleep>} sleep
     * @returns {(Promise<Sleep>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing sleep.
     */
    public async add(sleep: Sleep | Array<Sleep>): Promise<Sleep | MultiStatus<Sleep>> {
        try {
            // Multiple items of Sleep
            if (sleep instanceof Array) {
                const result = await this.addMultipleSleep(sleep)
                return Promise.resolve(result)
            }

            // Only one item
            return this.addSleep(sleep)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of Sleep.
     * Before adding, it is checked whether each of the sleep objects already exists.
     *
     * @param sleep
     * @return {Promise<MultiStatus<Sleep>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleSleep(sleep: Array<Sleep>): Promise<MultiStatus<Sleep>> {
        const multiStatus: MultiStatus<Sleep> = new MultiStatus<Sleep>()
        const statusSuccessArr: Array<StatusSuccess<Sleep>> = new Array<StatusSuccess<Sleep>>()
        const statusErrorArr: Array<StatusError<Sleep>> = new Array<StatusError<Sleep>>()

        for (const elem of sleep) {
            try {
                // Add each sleep from the array
                await this.addSleep(elem)

                // Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Sleep> = new StatusSuccess<Sleep>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Sleep> = new StatusError<Sleep>(statusCode, err.message,
                    err.description, elem)
                statusErrorArr.push(statusError)
            }
        }

        // Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        // Returns the created MultiStatus object.
        return Promise.resolve(multiStatus)
    }

    /**
     * Adds the data of one item of Sleep.
     * Before adding, it is checked whether the sleep already exists.
     *
     * @param sleep Sleep
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addSleep(sleep: Sleep): Promise<Sleep> {
        try {
            // 1. Validate the object.
            CreateSleepValidator.validate(sleep)

            // 2. Checks if sleep already exists.
            const sleepExist = await this._sleepRepository.checkExist(sleep)
            if (sleepExist) throw new ConflictException(Strings.SLEEP.ALREADY_REGISTERED)

            // 3. Create new sleep register.
            const sleepSaved: Sleep = await this._sleepRepository.create(sleep)

            // 4. If created successfully, the object is published on the message bus.
            if (sleepSaved && !sleep.isFromEventBus) {
                this._eventBus.bus
                    .pubSaveSleep(sleepSaved)
                    .then(() => {
                        this._logger.info(`Sleep with ID: ${sleepSaved.id} published on event bus...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event SaveSleep. ${err.message}`)
                    })
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
        throw new Error('Unsupported feature!')
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
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(sleepId, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)

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
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

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
    public async updateByChild(sleep: Sleep): Promise<Sleep> {
        try {
            // 1. Validate the object.
            UpdateSleepValidator.validate(sleep)

            // 3. Update the sleep and save it in a variable.
            const sleepUpdated: Sleep = await this._sleepRepository.updateByChild(sleep)

            // 4. If updated successfully, the object is published on the message bus.
            if (sleepUpdated && !sleep.isFromEventBus) {
                this._eventBus.bus
                    .pubUpdateSleep(sleepUpdated)
                    .then(() => {
                        this._logger.info(`Sleep with ID: ${sleepUpdated.id} was updated...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event UpdateSleep. ${err.message}`)
                    })
            }
            // 5. Returns the updated object.
            return Promise.resolve(sleepUpdated)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Remove sleep according to its unique identifier and related child.
     *
     * @param sleepId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByChild(sleepId: string, childId: string): Promise<boolean> {
        try {
            // 1. Validate id's
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(sleepId, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create a Sleep with only one attribute, the id, to be used in publishing on the event bus
            const sleepToBeDeleted: Sleep = new Sleep()
            sleepToBeDeleted.id = sleepId

            const wasDeleted: boolean = await this._sleepRepository.removeByChild(sleepId, childId)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                this._eventBus.bus
                    .pubDeleteSleep(sleepToBeDeleted)
                    .then(() => {
                        this._logger.info(`Sleep with ID: ${sleepToBeDeleted.id} was deleted...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event DeleteSleep. ${err.message}`)
                    })
                // 4a. Returns true
                return Promise.resolve(true)
            }

            // 4b. Returns false
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async update(sleep: Sleep): Promise<Sleep> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public countSleep(childId: string): Promise<number> {
        return this._sleepRepository.countSleep(childId)
    }
}
