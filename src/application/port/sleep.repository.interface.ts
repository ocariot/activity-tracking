import { IRepository } from './repository.interface'
import { Sleep } from '../domain/model/sleep'

/**
 * Interface of the sleep repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link SleepRepository} for further information.
 * @extends {IRepository<Sleep>}
 */
export interface ISleepRepository extends IRepository<Sleep> {
    /**
     * Update user sleep data.
     *
     * @param sleep Containing the data to be updated
     * @param idUser User unique identifier.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    updateByUser(sleep: Sleep, idUser: string): Promise<Sleep>

    /**
     * Removes sleep according to its unique identifier and related user.
     *
     * @param idSleep Sleep unique identifier.
     * @param idUser User unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByUser(idSleep: string | number, idUser: string): Promise<boolean>

    /**
     * Checks if an sleep already has a registration.
     * What differs from one sleep to another is the start date and associated user.
     *
     * @param sleep
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(sleep: Sleep): Promise<boolean>
}
