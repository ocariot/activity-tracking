import { IService } from './service.interface'
import { IQuery } from './query.interface'
import { BodyFat } from '../domain/model/body.fat'

/**
 * BodyFat service interface.
 *
 * @extends {IService<BodyFat>}
 */
export interface IBodyFatService extends IService<BodyFat> {
    /**
     * Add a new BodyFat or a list of BodyFat.
     *
     * @param bodyFat BodyFat | Array<BodyFat> to insert.
     * @return {Promise<BodyFat | any>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    add(bodyFat: BodyFat | Array<BodyFat>): Promise<BodyFat | any>

    /**
     * List the BodyFat of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<BodyFat>>}
     * @throws {RepositoryException}
     */
    getAllByChild(childId: string, query: IQuery): Promise<Array<BodyFat>>

    /**
     * Retrieve BodyFat by unique identifier (ID) and related child.
     *
     * @param bodyFatId BodyFat unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<BodyFat>}
     * @throws {RepositoryException}
     */
    getByIdAndChild(bodyFatId: string, childId: string, query: IQuery): Promise<BodyFat>

    /**
     * Removes BodyFat according to its unique identifier and related child.
     *
     * @param bodyFatId BodyFat unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(bodyFatId: string, childId: string): Promise<boolean>

    /**
     * Returns the total of body fats of a child.
     *
     * @param childId Child id associated with BodyFat objects.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countByChild(childId: string): Promise<number>
}
