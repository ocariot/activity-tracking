import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IEnvironmentRepository } from '../port/environment.repository.interface'
import { IEnvironmentService } from '../port/environment.service.interface'
import { Environment } from '../domain/model/environment'
import { IQuery } from '../port/query.interface'
import { CreateEnvironmentValidator } from '../domain/validator/create.environment.validator'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { EnvironmentSaveEvent } from '../integration-event/event/environment.save.event'
import { UuidValidator } from '../domain/validator/uuid.validator'
import { Strings } from '../../utils/strings'

/**
 * Implementing Environment Service.
 *
 * @implements {IEnvironmentService}
 */
@injectable()
export class EnvironmentService implements IEnvironmentService {

    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.RABBITMQ_EVENT_BUS) readonly eventBus: IEventBus,
        @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    /**
     * Adds a new Environment.
     * Before adding, it is checked whether the environment already exists.
     *
     * @param {Environment} environment
     * @returns {(Promise<Environment>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing environment.
     */
    public async add(environment: Environment): Promise<Environment> {
        try {
            // 1. Validate the object.
            CreateEnvironmentValidator.validate(environment)

            // 2. Checks if environment already exists.
            const environmentExist = await this._environmentRepository.checkExist(environment)
            if (environmentExist) throw new ConflictException('Measurement of environment is already registered...')

            // 3. Create new environment register.
            const environmentSaved: Environment = await this._environmentRepository.create(environment)

            // 4. If created successfully, the object is published on the message bus.
            if (environmentSaved) {
                this.logger.info(`Measurement of environment with ID: ${environmentSaved.id} published on event bus...`)
                this.eventBus.publish(
                    new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date(), environmentSaved),
                    'environments.save'
                )
            }// 5. Returns the created object.
            return Promise.resolve(environmentSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all environment in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Environment>>}
     * @throws {RepositoryException}
     */
    public getAll(query: IQuery): Promise<Array<Environment>> {
        return this._environmentRepository.find(query)
    }

    /**
     * Remove Measurement from the environment according to its unique identifier.
     *
     * @param id Unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public remove(id: string): Promise<boolean> {
        UuidValidator.validate(id, Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)
        return this._environmentRepository.delete(id)
    }

    public getById(id: string, query: IQuery): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }

    public update(item: Environment): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }
}
