import { IService } from './service.interface'
import { IQuery } from './query.interface'
import { Sleep } from '../domain/model/sleep'

/**
 * Sleep service interface.
 *
 * @extends {IService<Sleep>}
 */
export interface ISleepService extends IService<Sleep> {
    /**
     * List the sleep of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    getAllByChild(childId: string, query: IQuery): Promise<Array<Sleep>>

    /**
     * Retrieve sleep by unique identifier (ID)  and related child.
     *
     * @param sleepId Sleep unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {RepositoryException}
     */
    getByIdAndChild(sleepId: string, childId: string, query: IQuery): Promise<Sleep>

    /**
     * Update child sleep data.
     *
     * @param item Containing the data to be updated
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByChild(item: Sleep): Promise<Sleep>

    /**
     * Removes sleep according to its unique identifier and related child.
     *
     * @param sleepId Sleep unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(sleepId: string, childId: string): Promise<boolean>
}
