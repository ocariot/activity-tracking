import { IService } from './service.interface'
import { Environment } from '../domain/model/environment'

/**
 * Environment service interface.
 *
 * @extends {IService}
 */
export interface IEnvironmentService extends IService<Environment> {
    /**
     * Add a new Environment or a list of Environments.
     *
     * @param environment Environment | Array<Environment> to insert.
     * @return {Promise<Environment | any>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    add(environment: Environment | Array<Environment>): Promise<Environment | any>

    /**
     * Returns the total of environments.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>
}
