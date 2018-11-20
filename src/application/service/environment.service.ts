import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IEnvironmentRepository } from '../port/environment.repository.interface'
import { IEnvironmentService } from '../port/environment.service.interface'
import { Environment } from '../domain/model/environment'
import { IQuery } from '../port/query.interface'
import { EnvironmentValidator } from '../domain/validator/environment.validator'

/**
 * Implementing Environment Service.
 *
 * @implements {IEnvironmentService}
 */
@injectable()
export class EnvironmentService implements IEnvironmentService {

    constructor(
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository
    ) {
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
        EnvironmentValidator.validate(environment)
        const environmentExist = await this._environmentRepository.checkExist(environment)
        if (environmentExist) throw new ConflictException('Measurement of environment is already registered...')
        return this._environmentRepository.create(environment)
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

    public getById(id: string | number, query: IQuery): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }

    public remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public update(item: Environment): Promise<Environment> {
        throw new Error('Unsupported feature!')
    }
}
