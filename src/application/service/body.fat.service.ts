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
import { IBodyFatService } from '../port/body.fat.service.interface'
import { IBodyFatRepository } from '../port/body.fat.repository.interface'
import { BodyFat } from '../domain/model/body.fat'
import { CreateBodyFatValidator } from '../domain/validator/create.body.fat.validator'
import { MeasurementType } from '../domain/model/measurement'
import { IWeightRepository } from '../port/weight.repository.interface'

/**
 * Implementing BodyFat Service.
 *
 * @implements {IBodyFatService}
 */
@injectable()
export class BodyFatService implements IBodyFatService {

    constructor(@inject(Identifier.BODY_FAT_REPOSITORY) private readonly _bodyFatRepository: IBodyFatRepository,
                @inject(Identifier.WEIGHT_REPOSITORY) private readonly _weightRepository: IWeightRepository
    ) {
    }

    /**
     * Adds a new BodyFat or a list of BodyFat.
     * Before adding, it is checked whether the BodyFat already exists.
     *
     * @param {BodyFat | Array<BodyFat>} bodyFat
     * @returns {(Promise<BodyFat | MultiStatus<BodyFat>>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing BodyFat.
     */
    public async add(bodyFat: BodyFat | Array<BodyFat>): Promise<BodyFat | MultiStatus<BodyFat>> {
        try {
            // Multiple items of BodyFat
            if (bodyFat instanceof Array) {
                const result = await this.addMultipleFat(bodyFat)
                return Promise.resolve(result)
            }

            // Only one item
            return this.addFat(bodyFat)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of BodyFat.
     * Before adding, it is checked whether each of the BodyFat objects already exists.
     *
     * @param bodyFat
     * @return {Promise<MultiStatus<BodyFat>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleFat(bodyFat: Array<BodyFat>): Promise<MultiStatus<BodyFat>> {
        const multiStatus: MultiStatus<BodyFat> = new MultiStatus<BodyFat>()
        const statusSuccessArr: Array<StatusSuccess<BodyFat>> = new Array<StatusSuccess<BodyFat>>()
        const statusErrorArr: Array<StatusError<BodyFat>> = new Array<StatusError<BodyFat>>()

        for (const elem of bodyFat) {
            try {
                // Add each body fat from the array
                const bodyFatResult = await this.addFat(elem)

                // Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<BodyFat> = new StatusSuccess<BodyFat>(HttpStatus.CREATED, bodyFatResult)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<BodyFat> = new StatusError<BodyFat>(statusCode, err.message,
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
     * Adds the data of one item of BodyFat.
     * Before adding, it is checked whether the BodyFat already exists.
     *
     * @param bodyFat BodyFat
     * @return {Promise<BodyFat>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addFat(bodyFat: BodyFat): Promise<BodyFat> {
        try {
            // 1. Validate the object.
            CreateBodyFatValidator.validate(bodyFat)

            // 2. Checks if BodyFat already exists.
            const bodyFatExist = await this._bodyFatRepository.checkExist(bodyFat)
            if (bodyFatExist) throw new ConflictException(Strings.BODY_FAT.ALREADY_REGISTERED)

            // 3. Create new BodyFat register.
            const bodyFatSaved: BodyFat = await this._bodyFatRepository.create(bodyFat)

            // 4. Returns the created object.
            return Promise.resolve(bodyFatSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all BodyFat in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<BodyFat>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<BodyFat>> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get in infrastructure the BodyFat data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<BodyFat>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<BodyFat> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve BodyFat by unique identifier (ID) and child ID.
     *
     * @param bodyFatId BodyFat unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<BodyFat>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(bodyFatId: string, childId: string, query: IQuery): Promise<BodyFat> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(bodyFatId, Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ _id: bodyFatId, child_id: childId })
        return this._bodyFatRepository.findOne(query)
    }

    /**
     * List the BodyFat of a child.
     *
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<BodyFat>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(childId: string, query: IQuery): Promise<Array<BodyFat>> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ child_id: childId, type: MeasurementType.BODY_FAT })
        return this._bodyFatRepository.find(query)
    }

    /**
     * Remove BodyFat according to its unique identifier and related child.
     *
     * @param bodyFatId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByChild(bodyFatId: string, childId: string): Promise<boolean> {
        try {
            // 1. Validate id's
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(bodyFatId, Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create a BodyFat with only one attribute, the id, to be used in publishing on the event bus
            const bodyFatToBeDeleted: BodyFat = new BodyFat()
            bodyFatToBeDeleted.id = bodyFatId

            await this._weightRepository.disassociateBodyFat(bodyFatId)

            const wasDeleted: boolean = await this._bodyFatRepository.removeByChild(bodyFatId, childId, MeasurementType.BODY_FAT)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                // 4a. Returns true
                return Promise.resolve(true)
            }

            // 4b. Returns false
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async update(bodyFat: BodyFat): Promise<BodyFat> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public countBodyFats(childId: string): Promise<number> {
        return this._bodyFatRepository.countBodyFats(childId)
    }
}
