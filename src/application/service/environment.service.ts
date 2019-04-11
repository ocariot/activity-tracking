import HttpStatus from 'http-status-codes'
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
import { EnvironmentEvent } from '../integration-event/event/environment.event'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'

/**
 * Implementing Environment Service.
 *
 * @implements {IEnvironmentService}
 */
@injectable()
export class EnvironmentService implements IEnvironmentService {

    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
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
                return await this.addMultipleEnvs(environment)
            }
            // Only one item
            return await this.addEnvironment(environment)
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
                // 1. Validate the object.
                CreateEnvironmentValidator.validate(elem)

                // 2. Checks if environment already exists.
                const envItemExist = await this._environmentRepository.checkExist(elem)
                if (envItemExist) throw new ConflictException('Measurement of environment is already registered...')

                // 3. Create new environment register.
                const envItemSaved: Environment = await this._environmentRepository.create(elem)

                // 4. If created successfully, the object is published on the message bus.
                if (envItemSaved) {
                    const event: EnvironmentEvent = new EnvironmentEvent('EnvironmentSaveEvent',
                        new Date(), envItemSaved)
                    if (!(await this._eventBus.publish(event, 'environments.save'))) {
                        // 5. Save Event for submission attempt later when there is connection to message channel.
                        this.saveEvent(event)
                    } else {
                        this._logger.info(`Measurement of environment with ID: ${envItemSaved.id} published on event bus...`)
                    }
                }

                // 6a. Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Environment> = new StatusSuccess<Environment>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 6b. Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Environment> = new StatusError<Environment>(statusCode, err.message,
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
            if (environmentExist) throw new ConflictException('Measurement of environment is already registered...')

            // 3. Create new environment register.
            const environmentSaved: Environment = await this._environmentRepository.create(environment)

            // 4. If created successfully, the object is published on the message bus.
            if (environmentSaved) {
                const event: EnvironmentEvent = new EnvironmentEvent('EnvironmentSaveEvent',
                    new Date(), environmentSaved)
                if (!(await this._eventBus.publish(event, 'environments.save'))) {
                    // 5. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Measurement of environment with ID: ${environmentSaved.id} published on event bus...`)
                }
            }

            // 6. Returns the created object.
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
    public async remove(id: string): Promise<boolean> {
        try {
            // 1. Validate id parameter.
            ObjectIdValidator.validate(id, Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create an environment with a single attribute, its id, to be used in publishing on event bus.
            const environmentToBeDeleted: Environment = new Environment()
            environmentToBeDeleted.id = id

            const wasDeleted: boolean = await this._environmentRepository.delete(id)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: EnvironmentEvent = new EnvironmentEvent('EnvironmentDeleteEvent', new Date(), environmentToBeDeleted)
                if (!(await this._eventBus.publish(event, 'environments.delete'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Measurement of environment with ID: ${environmentToBeDeleted.id} was deleted...`)
                }

                // 5a. Returns true.
                return Promise.resolve(true)
            }
            // 5b. Returns false.
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

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: IntegrationEvent<Environment>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'EnvironmentSaveEvent') saveEvent.__routing_key = 'environments.save'
        if (event.event_name === 'EnvironmentDeleteEvent') saveEvent.__routing_key = 'environments.delete'
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
