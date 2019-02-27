import { IService } from './service.interface'
import { PhysicalActivityLog } from 'application/domain/model/physical.activity.log'
import { Log, LogType } from 'application/domain/model/log'
import { IQuery } from './query.interface'

/**
 * PhysicalActivityLog service interface.
 *
 * @extends {IService<PhysicalActivityLog}
 */
export interface IPhysicalActivityLogService extends IService<PhysicalActivityLog> {

    /**
     * Add a new activity log.
     *
     * @param activityLog Log to insert.
     * @return {Promise<Log>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    addLogs(activityLog: Array<Log>): Promise<Array<Log>>

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
    getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery): Promise<Array<Log>>

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
    getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: Date,
                              dateEnd: Date, query: IQuery): Promise<Array<Log>>
}
