import { IRepository } from './repository.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'

/**
 * Interface of the activity repository.
 * Must be implemented by the activity repository at the infrastructure layer.
 *
 * @see {@link PhysicalActivityRepository} for further information.
 * @extends {IRepository<PhysicalActivity>}
 */
export interface IPhysicalActivityRepository extends IRepository<PhysicalActivity> {
    /**
     * Update child activity data.
     *
     * @param activity Containing the data to be updated
     * @param childId Child unique identifier.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByChild(activity: PhysicalActivity, childId: string): Promise<PhysicalActivity>

    /**
     * Removes activity according to its unique identifier and related child.
     *
     * @param activityId PhysicalActivity unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(activityId: string | number, childId: string): Promise<boolean>

    /**
     * Checks if an activity already has a registration.
     * What differs from one activity to another is the start date and associated child.
     *
     * @param activity
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(activity: PhysicalActivity): Promise<boolean>
}
