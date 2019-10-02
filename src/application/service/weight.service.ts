import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { IWeightService } from '../port/weight.service.interface'
import { IWeightRepository } from '../port/weight.repository.interface'
import { Weight } from '../domain/model/weight'
import { CreateWeightValidator } from '../domain/validator/create.weight.validator'
import { MeasurementType } from '../domain/model/measurement'
import { BodyFat } from '../domain/model/body.fat'
import { IBodyFatRepository } from '../port/body.fat.repository.interface'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing Weight Service.
 *
 * @implements {IWeightService}
 */
@injectable()
export class WeightService implements IWeightService {

    constructor(@inject(Identifier.WEIGHT_REPOSITORY) private readonly _weightRepository: IWeightRepository,
                @inject(Identifier.BODY_FAT_REPOSITORY) private readonly _bodyFatRepository: IBodyFatRepository,
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
                const result = await this.addMultipleWeight(weight)
                return Promise.resolve(result)
            }

            // Only one item
            return this.addWeight(weight)
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
                const weightResult = await this.addWeight(elem)

                // Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Weight> = new StatusSuccess<Weight>(HttpStatus.CREATED, weightResult)
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

            // 2. Checks if Weight already exists.
            const weightExist = await this._weightRepository.checkExist(weight)
            if (weightExist) throw new ConflictException(Strings.WEIGHT.ALREADY_REGISTERED)

            // 3. Create new BodyFat register if does not already exist.
            let bodyFatSaved: BodyFat = new BodyFat()

            if (weight.body_fat) {
                const bodyFat: BodyFat = await this._bodyFatRepository.selectByChild(weight.body_fat.timestamp!,
                    weight.body_fat.child_id!, weight.body_fat.type!)
                if (bodyFat) {
                    bodyFat.value = weight.body_fat.value
                    await this._bodyFatRepository.update(bodyFat)

                    weight.body_fat = bodyFat
                }
                else {
                    bodyFatSaved = await this._bodyFatRepository.create(weight.body_fat)
                    weight.body_fat = bodyFatSaved
                }
            }

            // 4. Create new Weight register.
            const weightSaved: Weight = await this._weightRepository.create(weight)

            // 5. If created successfully, the object is published on the message bus.
            if (weightSaved && !weight.isFromEventBus) {
                this._eventBus.bus
                    .pubSaveWeight(weightSaved)
                    .then(() => {
                        this._logger.info(`Weight with ID: ${weightSaved.id} published on event bus...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event SaveWeight. ${err.message}`)
                    })
            }
            // 6. Returns the created object.
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

        query.addFilter({ child_id: childId })
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
                this._eventBus.bus
                    .pubDeleteWeight(weightToBeDeleted)
                    .then(() => {
                        this._logger.info(`Weight with ID: ${weightToBeDeleted.id} was deleted...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event DeleteWeight. ${err.message}`)
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

    public async update(weight: Weight): Promise<Weight> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public countWeights(childId: string): Promise<number> {
        return this._weightRepository.countWeights(childId)
    }
}
