import { IService } from './service.interface'
import { IQuery } from './query.interface'
import { Fat } from '../domain/model/fat'

/**
 * Fat service interface.
 *
 * @extends {IService<Fat>}
 */
export interface IFatService extends IService<Fat> {
    /**
     * Add a new Fat or a list of Fat.
     *
     * @param fat Fat | Array<Fat> to insert.
     * @return {Promise<Fat | any>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    add(fat: Fat | Array<Fat>): Promise<Fat | any>

    /**
     * List the Fat of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Fat>>}
     * @throws {RepositoryException}
     */
    getAllByChild(childId: string, query: IQuery): Promise<Array<Fat>>

    /**
     * Retrieve Fat by unique identifier (ID) and related child.
     *
     * @param fatId Fat unique identifier.
     * @param childId Child unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Fat>}
     * @throws {RepositoryException}
     */
    getByIdAndChild(fatId: string, childId: string, query: IQuery): Promise<Fat>

    /**
     * Removes Fat according to its unique identifier and related child.
     *
     * @param fatId Fat unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByChild(fatId: string, childId: string): Promise<boolean>
}
