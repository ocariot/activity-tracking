import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IEnvironmentRepository } from '../port/environment.repository.interface'
import { IEnvironmentService } from '../port/environment.service.interface'
import { Environment } from '../domain/model/environment'
import { IQuery } from '../port/query.interface'
import { CreateEnvironmentValidator } from '../domain/validator/create.environment.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing Environment Service.
 *
 * @implements {IEnvironmentService}
 */
@injectable()
export class EnvironmentService implements IEnvironmentService {

    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    /**
     * Adds a new Environment or a list of Environments.
     *
     * @param {Environment | Array<Environment>} environment
     * @returns {(Promise<Environment | MultiStatus<Environment>>)}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public async add(environment: Environment | Array<Environment>): Promise<Environment | MultiStatus<Environment>> {
        try {
            // Multiple items of Environment
            if (environment instanceof Array) {
                const result = await this.addMultipleEnvs(environment)
                return Promise.resolve(result)
            }

            // Only one item
            return this.addEnvironment(environment)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of Environment.
     * Before adding, it is checked whether each of the environments already exists.
     *
     * @param environment
     * @return {Promise<MultiStatus<Environment>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleEnvs(environment: Array<Environment>): Promise<MultiStatus<Environment>> {
        const multiStatus: MultiStatus<Environment> = new MultiStatus<Environment>()
        const statusSuccessArr: Array<StatusSuccess<Environment>> = new Array<StatusSuccess<Environment>>()
        const statusErrorArr: Array<StatusError<Environment>> = new Array<StatusError<Environment>>()

        for (const elem of environment) {
            try {
                // Add each environment from the array
                const environmentResult = await this.addEnvironment(elem)

                // Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Environment> = new StatusSuccess<Environment>(HttpStatus.CREATED, environmentResult)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Environment> = new StatusError<Environment>(statusCode, err.message,
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
     * Adds the data of one item of Environment.
     * Before adding, it is checked whether the environment already exists.
     *
     * @param environment
     * @return {Promise<Environment>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addEnvironment(environment: Environment): Promise<Environment> {
        try {
            // 1. Validate the object.
            CreateEnvironmentValidator.validate(environment)

            // 2. Checks if environment already exists.
            const environmentExist = await this._environmentRepository.checkExist(environment)
            if (environmentExist) throw new ConflictException(Strings.ENVIRONMENT.ALREADY_REGISTERED)

            // 3. Create new environment register.
            const environmentSaved: Environment = await this._environmentRepository.create(environment)

            // 4. If created successfully, the object is published on the message bus.
            if (environmentSaved) {
                this._eventBus.bus
                    .pubSaveEnvironment(environmentSaved)
                    .then(() => {
                        this._logger.info(`Measurement of environment with ID: ${environmentSaved.id} published on event bus...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event SaveEnvironment. ${err.message}`)
                    })
            }

            // 5. Returns the created object.
            return Promise.resolve(environmentSaved)
        } catch (err) {
            if (err.message === Strings.ERROR_MESSAGE.REPO_CREATE_CONFLICT) {
                return Promise.reject(new ConflictException(Strings.ENVIRONMENT.ALREADY_REGISTERED))
            }
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all environments in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Environment>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Environment>> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get the data of all environment in the infrastructure.
     *
     * @param institutionId Institution ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Environment>>}
     * @throws {RepositoryException}
     */
    public getAllByInstitution(institutionId: string, query: IQuery): Promise<Array<Environment>> {
        ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)

        return this._environmentRepository.find(query)
    }

    /**
     * Removes all environments related with an Institution.
     *
     * @param institutionId Institution unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllByInstitution(institutionId: string, query: IQuery): Promise<boolean> {
        try {
            // 1. Validate id parameter.
            ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)

            const environmentsDeleted: Array<Environment> = await this._environmentRepository.find(query)

            const wasDeleted: boolean = await this._environmentRepository.removeAllByInstitution(institutionId)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                this._eventBus.bus
                    .pubDeleteEnvironment(environmentsDeleted)
                    .then(() => {
                        this._logger.info(`Institution-related environments measures with ID: ${institutionId} have been removed...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event DeleteEnvironment. ${err.message}`)
                    })
                // 4a. Returns true.
                return Promise.resolve(true)
            }
            // 4b. Returns false.
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Removes environment according to its unique identifier and related institution.
     *
     * @param environmentId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByInstitution(environmentId: string, institutionId: string): Promise<boolean> {
        try {
            // 1. Validate id parameters.
            ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(environmentId, Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create an environment with a single attribute, its id, to be used in publishing on event bus.
            const environmentToBeDeleted: Environment = new Environment()
            environmentToBeDeleted.id = environmentId

            const wasDeleted: boolean = await this._environmentRepository.removeByInstitution(environmentId, institutionId)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                this._eventBus.bus
                    .pubDeleteEnvironment(environmentToBeDeleted)
                    .then(() => {
                        this._logger.info(`Measurement of environment with ID: ${environmentToBeDeleted.id} was deleted...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event DeleteEnvironment. ${err.message}`)
                    })
                // 4a. Returns true.
                return Promise.resolve(true)
            }
            // 4b. Returns false.
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public getById(id: string, query: IQuery): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }

    public update(item: Environment): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Returns the total of environments of an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    public countByInstitution(institutionId: string): Promise<number> {
        return this._environmentRepository.countByInstitution(institutionId)
    }
}
