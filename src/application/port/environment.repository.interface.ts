import { IRepository } from './repository.interface'
import { Environment } from '../domain/model/environment'

/**
 * Interface of the Environment repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link EnvironmentRepository} for further information.
 * @extends {IRepository<Environment>}
 */
export interface IEnvironmentRepository extends IRepository<Environment> {
    /**
     * Checks whether an environment measurement already has a record.
     * What differs from one environment measurement to another is its timestamp and location.
     *
     * @param environment
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(environment: Environment): Promise<boolean>
}
