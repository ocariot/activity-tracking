import { IRepository } from './repository.interface'
import { Fat } from '../domain/model/fat'

/**
 * Interface of the Fat repository.
 * Must be implemented by the Fat repository at the infrastructure layer.
 *
 * @see {@link FatRepository} for further information.
 * @extends {IRepository<Fat>}
 */
export interface IFatRepository extends IRepository<Fat> {
    /**
     * Removes Fat according to its unique identifier and related child.
     *
     * @param fatId Fat unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(fatId: string, childId: string): Promise<boolean>

    /**
     * Checks if a Fat already has a registration.
     * What differs from one Fat to another is the start date and associated child.
     *
     * @param fat
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(fat: Fat): Promise<boolean>

    /**
     * Removes all Fat objects associated with the childId received.
     *
     * @param childId Child id associated with Fat objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllFatFromChild(childId: string): Promise<boolean>
}
