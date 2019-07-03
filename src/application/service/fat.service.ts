import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { IFatService } from '../port/fat.service.interface'
import { IFatRepository } from '../port/fat.repository.interface'
import { Fat } from '../domain/model/fat'
import { CreateFatValidator } from '../domain/validator/create.fat.validator'
import { FatEvent } from '../integration-event/event/fat.event'
import { MeasurementType } from '../domain/model/measurement'

/**
 * Implementing Fat Service.
 *
 * @implements {IFatService}
 */
@injectable()
export class FatService implements IFatService {

    constructor(@inject(Identifier.FAT_REPOSITORY) private readonly _fatRepository: IFatRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    /**
     * Adds a new Fat or a list of Fat.
     * Before adding, it is checked whether the Fat already exists.
     *
     * @param {Fat | Array<Fat>} fat
     * @returns {(Promise<Fat | MultiStatus<Fat>>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing Fat.
     */
    public async add(fat: Fat | Array<Fat>): Promise<Fat | MultiStatus<Fat>> {
        try {
            // Multiple items of Fat
            if (fat instanceof Array) {
                return await this.addMultipleFat(fat)
            }

            // Only one item
            return await this.addFat(fat)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of Fat.
     * Before adding, it is checked whether each of the Fat objects already exists.
     *
     * @param fat
     * @return {Promise<MultiStatus<Fat>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleFat(fat: Array<Fat>): Promise<MultiStatus<Fat>> {
        const multiStatus: MultiStatus<Fat> = new MultiStatus<Fat>()
        const statusSuccessArr: Array<StatusSuccess<Fat>> = new Array<StatusSuccess<Fat>>()
        const statusErrorArr: Array<StatusError<Fat>> = new Array<StatusError<Fat>>()

        for (const elem of fat) {
            try {
                // 1. Validate the object.
                CreateFatValidator.validate(elem)

                // 2. Checks if Fat already exists.
                const fatExist = await this._fatRepository.checkExist(elem)
                if (fatExist) throw new ConflictException('Fat is already registered...')

                // 3. Create new Fat register.
                const fatItemSaved: Fat = await this._fatRepository.create(elem)

                // 4. If created successfully, the object is published on the message bus.
                if (fatItemSaved) {
                    const event: FatEvent = new FatEvent('FatSaveEvent', new Date(), fatItemSaved)
                    if (!(await this._eventBus.publish(event, 'fat.save'))) {
                        // 5. Save Event for submission attempt later when there is connection to message channel.
                        this.saveEvent(event)
                    } else {
                        this._logger.info(`Fat with ID: ${fatItemSaved.id} published on event bus...`)
                    }
                }

                // 6a. Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Fat> = new StatusSuccess<Fat>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 6b. Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Fat> = new StatusError<Fat>(statusCode, err.message,
                    err.description, elem)
                statusErrorArr.push(statusError)
            }
        }

        // 7. Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        // 8. Returns the created MultiStatus object.
        return Promise.resolve(multiStatus)
    }

    /**
     * Adds the data of one item of Fat.
     * Before adding, it is checked whether the Fat already exists.
     *
     * @param fat Fat
     * @return {Promise<Fat>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addFat(fat: Fat): Promise<Fat> {
        try {
            // 1. Validate the object.
            CreateFatValidator.validate(fat)

            // 2. Checks if Fat already exists.
            const fatExist = await this._fatRepository.checkExist(fat)
            if (fatExist) throw new ConflictException('Fat is already registered...')

            // 3. Create new Fat register.
            const fatSaved: Fat = await this._fatRepository.create(fat)

            // 4. If created successfully, the object is published on the message bus.
            if (fatSaved) {
                const event: FatEvent = new FatEvent('FatSaveEvent', new Date(), fatSaved)
                if (!(await this._eventBus.publish(event, 'fat.save'))) {
                    // 5. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Fat with ID: ${fatSaved.id} published on event bus...`)
                }
            }
            // 5. Returns the created object.
            return Promise.resolve(fatSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all Fat in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Fat>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Fat>> {
        return this._fatRepository.find(query)
    }

    /**
     * Get in infrastructure the Fat data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Fat>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<Fat> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve Fat by unique identifier (ID) and child ID.
     *
     * @param fatId Fat unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Fat>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(fatId: string, childId: string, query: IQuery): Promise<Fat> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(fatId, Strings.FAT.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ _id: fatId, child_id: childId })
        return this._fatRepository.findOne(query)
    }

    /**
     * List the Fat of a child.
     *
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Fat>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(childId: string, query: IQuery): Promise<Array<Fat>> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ child_id: childId })
        return this._fatRepository.find(query)
    }

    /**
     * Remove Fat according to its unique identifier and related child.
     *
     * @param fatId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByChild(fatId: string, childId: string): Promise<boolean> {
        try {
            // 1. Validate id's
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(fatId, Strings.FAT.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create a Fat with only one attribute, the id, to be used in publishing on the event bus
            const fatToBeDeleted: Fat = new Fat()
            fatToBeDeleted.id = fatId

            const wasDeleted: boolean = await this._fatRepository.removeByChild(fatId, childId, MeasurementType.FAT)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: FatEvent = new FatEvent('FatDeleteEvent', new Date(), fatToBeDeleted)
                if (!(await this._eventBus.publish(event, 'fat.delete'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Fat with ID: ${fatToBeDeleted.id} was deleted...`)
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

    public async update(fat: Fat): Promise<Fat> {
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
    private saveEvent(event: IntegrationEvent<Fat>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'FatSaveEvent') saveEvent.__routing_key = 'fat.save'
        if (event.event_name === 'FatDeleteEvent') saveEvent.__routing_key = 'fat.delete'
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
