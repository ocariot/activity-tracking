import { IService } from './service.interface'
import { Activity } from '../domain/model/activity'
import { IQuery } from './query.interface'

/**
 * Activity service interface.
 *
 * @extends {IService<Activity>}
 */
export interface IActivityService extends IService<Activity> {
    /**
     * List the activities of a user.
     *
     * @param idUser User ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Activity>>}
     * @throws {RepositoryException}
     */
    getAllByUser(idUser: string, query: IQuery): Promise<Array<Activity>>

    /**
     * Retrieve activity by unique identifier (ID)  and related user.
     *
     * @param idActivity Activity unique identifier.
     * @param idUser User unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Activity>}
     * @throws {RepositoryException}
     */
    getByIdAndUser(idActivity: string, idUser: string, query: IQuery): Promise<Activity>

    /**
     * Update user activity data.
     *
     * @param item Containing the data to be updated
     * @param idUser User unique identifier.
     * @return {Promise<Activity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByUser(item: Activity, idUser: string): Promise<Activity>

    /**
     * Removes activity according to its unique identifier and related user.
     *
     * @param idActivity Activity unique identifier.
     * @param idUser User unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByUser(idActivity: string | number, idUser: string): Promise<boolean>
}
