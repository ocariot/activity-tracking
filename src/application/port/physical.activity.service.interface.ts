import { IService } from './service.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'
import { IQuery } from './query.interface'

/**
 * PhysicalActivity service interface.
 *
 * @extends {IService<PhysicalActivity>}
 */
export interface IPhysicalActivityService extends IService<PhysicalActivity> {
    /**
     * List the activities of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    getAllByChild(childId: string, query: IQuery): Promise<Array<PhysicalActivity>>

    /**
     * Retrieve physicalactivity by unique identifier (ID)  and related child.
     *
     * @param activityId PhysicalActivity unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}
     * @throws {RepositoryException}
     */
    getByIdAndChild(activityId: string, childId: string, query: IQuery): Promise<PhysicalActivity>

    /**
     * Update child physicalactivity data.
     *
     * @param physicalActivity Containing the data to be updated
     * @param userId Child unique identifier.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByChild(physicalActivity: PhysicalActivity, userId: string): Promise<PhysicalActivity>

    /**
     * Removes physicalactivity according to its unique identifier and related child.
     *
     * @param activityId PhysicalActivity unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(activityId: string | number, childId: string): Promise<boolean>
}
