import { IService } from './service.interface'
import { Environment } from '../domain/model/environment'

/**
 * Environment service interface.
 *
 * @extends {IService}
 */
export interface IEnvironmentService extends IService<Environment> {
    /**
     * Add a new item.
     *
     * @param item T to insert.
     * @return {Promise<T>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    add(item: Environment | Array<Environment>): Promise<Environment | any>
}
