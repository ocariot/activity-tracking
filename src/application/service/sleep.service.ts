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
import { SleepEvent } from '../integration-event/event/sleep.event'
import { UpdateSleepValidator } from '../domain/validator/update.sleep.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'

/**
 * Implementing sleep Service.
 *
 * @implements {ISleepService}
 */
@injectable()
export class SleepService implements ISleepService {

    constructor(@inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
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
                const event: SleepEvent = new SleepEvent('SleepSaveEvent', new Date(), sleepSaved)
                if (!(await this._eventBus.publish(event, 'sleep.save'))) {
                    // 5. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Sleep with ID: ${sleepSaved.id} published on event bus...`)
                }
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

            // 2. Update the sleep and save it in a variable.
            const sleepUpdated: Sleep = await this._sleepRepository.updateByChild(sleep)

            // 3. If updated successfully, the object is published on the message bus.
            if (sleepUpdated) {
                const event: SleepEvent = new SleepEvent('SleepUpdateEvent',
                    new Date(), sleepUpdated)
                if (!(await this._eventBus.publish(event, 'sleep.update'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Sleep with ID: ${sleepUpdated.id} was updated...`)
                }
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

            // 2. Create a Sleep with only two attributes, the id and child_id, to be used in publishing on the event bus
            const sleepToBeDeleted: Sleep = new Sleep()
            sleepToBeDeleted.id = sleepId
            sleepToBeDeleted.child_id = childId

            const wasDeleted: boolean = await this._sleepRepository.removeByChild(sleepId, childId)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: SleepEvent = new SleepEvent('SleepDeleteEvent', new Date(), sleepToBeDeleted)
                if (!(await this._eventBus.publish(event, 'sleep.delete'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Sleep with ID: ${sleepToBeDeleted.id} and child_id: ${sleepToBeDeleted.child_id} was deleted...`)
                }

                // 5a. Returns true
                return Promise.resolve(true)
            }

            // 5b. Returns false
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

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: IntegrationEvent<Sleep>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'SleepSaveEvent') saveEvent.__routing_key = 'sleep.save'
        if (event.event_name === 'SleepDeleteEvent') saveEvent.__routing_key = 'sleep.delete'
        if (event.event_name === 'SleepUpdateEvent') saveEvent.__routing_key = 'sleep.update'
        this._integrationEventRepository
            .create(JSON.parse(JSON.stringify(saveEvent)))
            .then(() => {
                this._logger.warn(`Could not publish the event named ${event.event_name}.`
                    .concat(` The event was saved in the database for a possible recovery.`))
            })
            .catch(err => {
                this._logger.error(`There was an error trying to save the name event: ${event.event_name}.`
                    .concat(`Error: ${err.message}. Event: ${JSON.stringify(saveEvent)}`))
            })
    }
}
