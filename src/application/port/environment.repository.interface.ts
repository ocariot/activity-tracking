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
     * Removes environment according to its unique identifier and related institution.
     *
     * @param environmentId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByInstitution(environmentId: string | number, institutionId: string): Promise<boolean>

    /**
     * Removes all environments associated with an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllByInstitution(institutionId: string): Promise<boolean>

    /**
     * Returns the total of environments of an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countByInstitution(institutionId: string): Promise<number>
}
