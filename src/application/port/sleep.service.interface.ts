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
     * List the sleep of a user.
     *
     * @param idUser User ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    getAllByUser(idUser: string, query: IQuery): Promise<Array<Sleep>>

    /**
     * Retrieve sleep by unique identifier (ID)  and related user.
     *
     * @param idSleep Sleep unique identifier.
     * @param idUser User unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {RepositoryException}
     */
    getByIdAndUser(idSleep: string, idUser: string, query: IQuery): Promise<Sleep>

    /**
     * Update user sleep data.
     *
     * @param item Containing the data to be updated
     * @param idUser User unique identifier.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByUser(item: Sleep, idUser: string): Promise<Sleep>

    /**
     * Removes sleep according to its unique identifier and related user.
     *
     * @param idSleep Sleep unique identifier.
     * @param idUser User unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByUser(idSleep: string | number, idUser: string): Promise<boolean>
}
