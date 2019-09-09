import { IRepository } from './repository.interface'
import { Weight } from '../domain/model/weight'

/**
 * Interface of the Weight repository.
 * Must be implemented by the Weight repository at the infrastructure layer.
 *
 * @see {@link WeightRepository} for further information.
 * @extends {IRepository<Weight>}
 */
export interface IWeightRepository extends IRepository<Weight> {
    /**
     * Removes Weight according to its unique identifier and related child.
     *
     * @param weightId Weight unique identifier.
     * @param childId Child unique identifier.
     * @param measurementType Type of Measurement.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(weightId: string, childId: string, measurementType: string): Promise<boolean>

    /**
     * Checks if a Weight already has a registration.
     * What differs from one Weight to another is the start date and associated child.
     *
     * @param weight
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(weight: Weight): Promise<boolean>

    /**
     * Removes all Weight objects associated with the childId received.
     *
     * @param childId Child id associated with Weight objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllWeightFromChild(childId: string): Promise<boolean>

    /**
     * Disassociates a Weight object from a BodyFat.
     *
     * @param bodyFatId BodyFat id associated with Weight object.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    disassociateBodyFat(bodyFatId: string): Promise<boolean>

    /**
     * Returns the total of weights of a child.
     *
     * @param childId Child id associated with Weight objects.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countWeights(childId: string): Promise<number>
}
