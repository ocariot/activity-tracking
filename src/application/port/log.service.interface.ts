import { IService } from './service.interface'
import { Log, LogType } from 'application/domain/model/log'
import { IQuery } from './query.interface'
import { MultiStatus } from '../domain/model/multi.status'
import { PhysicalActivityLog } from '../domain/model/physical.activity.log'

/**
 * PhysicalActivityLog service interface.
 *
 * @extends {IService<PhysicalActivityLog}
 */
export interface ILogService extends IService<Log> {

    /**
     * Add a new activity log.
     *
     * @param activityLog Log to insert.
     * @return {Promise<Log>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    addLogs(activityLog: Array<Log>): Promise<MultiStatus<Log>>

    /**
     * List the physical activities logs with information on the total steps and calories of a child in a given period.
     *
     * @param childId Child ID.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivityLog>}
     * @throws {RepositoryException}
     */
    getByChildAndDate(childId: string, dateStart: string, dateEnd: string, query: IQuery): Promise<PhysicalActivityLog>

    /**
     * List the physical activities logs with information on the total steps or calories of a child in a given period
     *
     * @param childId Child ID.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string,
                              dateEnd: string, query: IQuery): Promise<Array<Log>>
}
