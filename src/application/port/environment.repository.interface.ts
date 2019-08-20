import { IRepository } from './repository.interface'
import { Environment } from '../domain/model/environment'

/**
 * Interface of the Environment repository.
 * Must be implemented by the child repository at the infrastructure layer.
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

    /**
     * Removes all environments associated with the institutionID received.
     *
     * @param institutionID Institution id associated with environments.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllEnvironmentsFromInstitution(institutionID: string): Promise<boolean>

    /**
     * Returns the total of environments.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>
}
