import { IService } from './service.interface'
import { IQuery } from './query.interface'
import { Weight } from '../domain/model/weight'

/**
 * Weight service interface.
 *
 * @extends {IService<Weight>}
 */
export interface IWeightService extends IService<Weight> {
    /**
     * Add a new Weight or a list of Weight.
     *
     * @param weight Weight | Array<Weight> to insert.
     * @return {Promise<Weight | any>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    add(weight: Weight | Array<Weight>): Promise<Weight | any>

    /**
     * List the Weight of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Weight>>}
     * @throws {RepositoryException}
     */
    getAllByChild(childId: string, query: IQuery): Promise<Array<Weight>>

    /**
     * Retrieve Weight by unique identifier (ID) and related child.
     *
     * @param weightId Weight unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Weight>}
     * @throws {RepositoryException}
     */
    getByIdAndChild(weightId: string, childId: string, query: IQuery): Promise<Weight>

    /**
     * Removes Weight according to its unique identifier and related child.
     *
     * @param weightId Weight unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(weightId: string, childId: string): Promise<boolean>
}
