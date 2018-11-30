import { IRepository } from './repository.interface'
import { Activity } from '../domain/model/activity'

/**
 * Interface of the activity repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link ActivityRepository} for further information.
 * @extends {IRepository<Activity>}
 */
export interface IActivityRepository extends IRepository<Activity> {
    /**
     * Update user activity data.
     *
     * @param activity Containing the data to be updated
     * @param idUser User unique identifier.
     * @return {Promise<Activity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByUser(activity: Activity, idUser: string): Promise<Activity>

    /**
     * Removes activity according to its unique identifier and related user.
     *
     * @param idActivity Activity unique identifier.
     * @param idUser User unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByUser(idActivity: string | number, idUser: string): Promise<boolean>

    /**
     * Checks if an activity already has a registration.
     * What differs from one activity to another is the start date and associated user.
     *
     * @param activity
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(activity: Activity): Promise<boolean>
}
