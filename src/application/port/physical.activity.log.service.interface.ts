import { IService } from './service.interface'
import { PhysicalActivityLog, PhysicalActivityLogType } from 'application/domain/model/physical.activity.log'
import { Log } from 'application/domain/model/log'
import { IQuery } from './query.interface'

/**
 * PhysicalActivityLog service interface.
 *
 * @extends {IService<PhysicalActivityLog}
 */
export interface IPhysicalActivityLogService extends IService<PhysicalActivityLog> {
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
    getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery): Promise<PhysicalActivityLog>

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
    getByChildResourceAndDate(childId: string, desiredResource: PhysicalActivityLogType, dateStart: Date,
                              dateEnd: Date, query: IQuery): Promise<Array<Log>>
}
