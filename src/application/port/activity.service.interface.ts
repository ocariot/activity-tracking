import { IService } from './service.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'
import { IQuery } from './query.interface'

/**
 * PhysicalActivity service interface.
 *
 * @extends {IService<PhysicalActivity>}
 */
export interface IActivityService extends IService<PhysicalActivity> {
    /**
     * List the activities of a child.
     *
     * @param idUser Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    getAllByUser(idUser: string, query: IQuery): Promise<Array<PhysicalActivity>>

    /**
     * Retrieve activity by unique identifier (ID)  and related child.
     *
     * @param idActivity PhysicalActivity unique identifier.
     * @param idUser Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}
     * @throws {RepositoryException}
     */
    getByIdAndUser(idActivity: string, idUser: string, query: IQuery): Promise<PhysicalActivity>

    /**
     * Update child activity data.
     *
     * @param item Containing the data to be updated
     * @param idUser Child unique identifier.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByUser(item: PhysicalActivity, idUser: string): Promise<PhysicalActivity>

    /**
     * Removes activity according to its unique identifier and related child.
     *
     * @param idActivity PhysicalActivity unique identifier.
     * @param idUser Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByUser(idActivity: string | number, idUser: string): Promise<boolean>
}
