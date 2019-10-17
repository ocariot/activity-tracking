import { IService } from './service.interface'
import { Log } from 'application/domain/model/log'
import { IQuery } from './query.interface'
import { MultiStatus } from '../domain/model/multi.status'
import { ChildLog } from '../domain/model/child.log'

/**
 * ChildLog service interface.
 *
 * @extends {IService<ChildLog}
 */
export interface ILogService extends IService<Log> {

    /**
     * Add a new child logs.
     *
     * @param log Array<Log> to insert.
     * @return {Promise<Log>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    addLogs(log: Array<Log>): Promise<MultiStatus<Log>>

    /**
     * List the child logs with information on the total steps, calories, active_minutes, lightly_active_minutes
     * and sedentary_minutes of a child in a given period.
     *
     * @param childId Child ID.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<ChildLog>}
     * @throws {RepositoryException}
     */
    getByChildAndDate(childId: string, dateStart: string, dateEnd: string, query: IQuery): Promise<ChildLog>

    /**
     * List the child logs with information on the total steps, calories, active_minutes, lightly_active_minutes,
     * or sedentary_minutes of a child in a given period
     *
     * @param childId Child ID.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    getByChildResourceAndDate(childId: string, desiredResource: string, dateStart: string,
                              dateEnd: string, query: IQuery): Promise<Array<Log>>
}
