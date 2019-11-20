import { IService } from './service.interface'
import { Environment } from '../domain/model/environment'
import { IQuery } from './query.interface'

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
     * List the environments of a Institution.
     *
     * @param institutionId Institution ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Environment>>}
     * @throws {RepositoryException}
     */
    getAllByInstitution(institutionId: string, query: IQuery): Promise<Array<Environment>>

    /**
     * Removes all environments associated with an Institution.
     *
     * @param institutionId Institution unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllByInstitution(institutionId: string, query: IQuery): Promise<boolean>

    /**
     * Removes environment according to its unique identifier and related institution.
     *
     * @param environmentId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByInstitution(environmentId: string, institutionId: string): Promise<boolean>

    /**
     * Returns the total of environments of an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countByInstitution(institutionId: string): Promise<number>
}
