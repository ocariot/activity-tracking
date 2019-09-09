import { IRepository } from './repository.interface'
import { Sleep } from '../domain/model/sleep'

/**
 * Interface of the sleep repository.
 * Must be implemented by the sleep repository at the infrastructure layer.
 *
 * @see {@link SleepRepository} for further information.
 * @extends {IRepository<Sleep>}
 */
export interface ISleepRepository extends IRepository<Sleep> {
    /**
     * Update child sleep data.
     *
     * @param sleep Containing the data to be updated
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByChild(sleep: Sleep): Promise<Sleep>

    /**
     * Removes sleep according to its unique identifier and related child.
     *
     * @param sleepId Sleep unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(sleepId: string, childId: string): Promise<boolean>

    /**
     * Checks if an sleep already has a registration.
     * What differs from one sleep to another is the start date and associated child.
     *
     * @param sleep
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(sleep: Sleep): Promise<boolean>

    /**
     * Removes all sleep objects associated with the childId received.
     *
     * @param childId Child id associated with sleep objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllSleepFromChild(childId: string): Promise<boolean>

    /**
     * Returns the total of sleep objects of a child.
     *
     * @param childId Child id associated with Sleep objects.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countSleep(childId: string): Promise<number>
}
