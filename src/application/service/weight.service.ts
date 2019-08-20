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
import { IWeightService } from '../port/weight.service.interface'
import { IWeightRepository } from '../port/weight.repository.interface'
import { Weight } from '../domain/model/weight'
import { WeightEvent } from '../integration-event/event/weight.event'
import { CreateWeightValidator } from '../domain/validator/create.weight.validator'
import { MeasurementType } from '../domain/model/measurement'
import { BodyFat } from '../domain/model/body.fat'
import { IBodyFatRepository } from '../port/body.fat.repository.interface'
import { BodyFatEvent } from '../integration-event/event/body.fat.event'

/**
 * Implementing Weight Service.
 *
 * @implements {IWeightService}
 */
@injectable()
export class WeightService implements IWeightService {

    constructor(@inject(Identifier.WEIGHT_REPOSITORY) private readonly _weightRepository: IWeightRepository,
                @inject(Identifier.BODY_FAT_REPOSITORY) private readonly _bodyFatRepository: IBodyFatRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    /**
     * Adds a new Weight or a list of Weight.
     * Before adding, it is checked whether the Weight already exists.
     *
     * @param {Weight | Array<Weight>} weight
     * @returns {(Promise<Weight | MultiStatus<Weight>>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing Weight.
     */
    public async add(weight: Weight | Array<Weight>): Promise<Weight | MultiStatus<Weight>> {
        try {
            // Multiple items of Weight
            if (weight instanceof Array) {
                return await this.addMultipleWeight(weight)
            }

            // Only one item
            return await this.addWeight(weight)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of Weight.
     * Before adding, it is checked whether each of the Weight objects already exists.
     *
     * @param weight
     * @return {Promise<MultiStatus<Weight>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleWeight(weight: Array<Weight>): Promise<MultiStatus<Weight>> {
        const multiStatus: MultiStatus<Weight> = new MultiStatus<Weight>()
        const statusSuccessArr: Array<StatusSuccess<Weight>> = new Array<StatusSuccess<Weight>>()
        const statusErrorArr: Array<StatusError<Weight>> = new Array<StatusError<Weight>>()

        for (const elem of weight) {
            try {
                // Add each weight from the array
                await this.addWeight(elem)

                // Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Weight> = new StatusSuccess<Weight>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Weight> = new StatusError<Weight>(statusCode, err.message,
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
     * Adds the data of one item of Weight.
     * Before adding, it is checked whether the Weight already exists.
     *
     * @param weight Weight
     * @return {Promise<Weight>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addWeight(weight: Weight): Promise<Weight> {
        try {
            // 1. Validate the object.
            CreateWeightValidator.validate(weight)

            // 1.5. Create new BodyFat register if does not already exist.
            let bodyFatSaved: BodyFat = new BodyFat()

            if (weight.body_fat) {
                const bodyFat: BodyFat = await this._bodyFatRepository.selectByChild(weight.body_fat.timestamp!,
                    weight.body_fat.child_id!, weight.body_fat.type!)

                if (bodyFat) weight.body_fat = bodyFat
                else {
                    bodyFatSaved = await this._bodyFatRepository.create(weight.body_fat)
                    weight.body_fat = bodyFatSaved

                    // 1.5b. If created successfully, the object is published on the message bus.
                    if (bodyFatSaved) {
                        const event: BodyFatEvent = new BodyFatEvent('BodyFatSaveEvent', new Date(), bodyFatSaved)
                        if (!(await this._eventBus.publish(event, 'bodyfat.save'))) {
                            // 1.5c. Save Event for submission attempt later when there is connection to message channel.
                            this.saveEvent(event)
                        } else {
                            this._logger.info(`Body Fat with ID: ${bodyFatSaved.id} published on event bus...`)
                        }
                    }
                }
            }

            // 2. Checks if Weight already exists.
            const weightExist = await this._weightRepository.checkExist(weight)
            if (weightExist) throw new ConflictException('Weight is already registered...')

            // 3. Create new Weight register.
            const weightSaved: Weight = await this._weightRepository.create(weight)

            // 4. If created successfully, the object is published on the message bus.
            if (weightSaved) {
                const event: WeightEvent = new WeightEvent('WeightSaveEvent', new Date(), weightSaved)
                if (!(await this._eventBus.publish(event, 'weight.save'))) {
                    // 5. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Weight with ID: ${weightSaved.id} published on event bus...`)
                }
            }
            // 5. Returns the created object.
            return Promise.resolve(weightSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all Weight in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Weight>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Weight>> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get in infrastructure the Weight data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Weight>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<Weight> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve Weight by unique identifier (ID) and child ID.
     *
     * @param weightId Weight unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Weight>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(weightId: string, childId: string, query: IQuery): Promise<Weight> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(weightId, Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ _id: weightId, child_id: childId })
        return this._weightRepository.findOne(query)
    }

    /**
     * List the Weight of a child.
     *
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Weight>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(childId: string, query: IQuery): Promise<Array<Weight>> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ child_id: childId, type: MeasurementType.WEIGHT })
        return this._weightRepository.find(query)
    }

    /**
     * Remove Weight according to its unique identifier and related child.
     *
     * @param weightId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByChild(weightId: string, childId: string): Promise<boolean> {
        try {
            // 1. Validate id's
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(weightId, Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create a Weight with only one attribute, the id, to be used in publishing on the event bus
            const weightToBeDeleted: Weight = new Weight()
            weightToBeDeleted.id = weightId

            const wasDeleted: boolean = await this._weightRepository.removeByChild(weightId, childId, MeasurementType.WEIGHT)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: WeightEvent = new WeightEvent('WeightDeleteEvent', new Date(), weightToBeDeleted)
                if (!(await this._eventBus.publish(event, 'weight.delete'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Weight with ID: ${weightToBeDeleted.id} was deleted...`)
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

    public async update(weight: Weight): Promise<Weight> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public countWeights(childId: string): Promise<number> {
        try {
            ObjectIdValidator.validate(childId)
        } catch (err) {
            return Promise.reject(err)
        }
        return this._weightRepository.countWeights(childId)
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: IntegrationEvent<Weight>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'WeightSaveEvent') saveEvent.__routing_key = 'weight.save'
        if (event.event_name === 'WeightDeleteEvent') saveEvent.__routing_key = 'weight.delete'
        if (event.event_name === 'BodyFatSaveEvent') saveEvent.__routing_key = 'bodyfat.save'
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
