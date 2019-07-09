import { IRepository } from './repository.interface'
import { BodyFat } from '../domain/model/body.fat'

/**
 * Interface of the BodyFat repository.
 * Must be implemented by the BodyFat repository at the infrastructure layer.
 *
 * @see {@link BodyFatRepository} for further information.
 * @extends {IRepository<BodyFat>}
 */
export interface IBodyFatRepository extends IRepository<BodyFat> {
    /**
     * Removes BodyFat according to its unique identifier and related child.
     *
     * @param bodyFatId BodyFat unique identifier.
     * @param childId Child unique identifier.
     * @param type Type of Measurement.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(bodyFatId: string, childId: string, type: string): Promise<boolean>

    /**
     * Checks if a BodyFat already has a registration.
     * What differs from one BodyFat to another is the start date and associated child.
     *
     * @param bodyFat
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(bodyFat: BodyFat): Promise<boolean>

    /**
     * Retrieves a BodyFat according to the parameters.
     *
     * @param bodyFatTimestamp Timestamp associated with BodyFat.
     * @param childId Child unique identifier.
     * @param bodyFatType Type of the Measurement.
     * @return {Promise<BodyFat>}
     * @throws {ValidationException | RepositoryException}
     */
    selectByChild(bodyFatTimestamp: Date, childId: string, bodyFatType: string): Promise<BodyFat>

    /**
     * Removes all BodyFat objects associated with the childId received.
     *
     * @param childId Child id associated with BodyFat objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllBodyFatFromChild(childId: string): Promise<boolean>
}
