import { IRepository } from './repository.interface'
import { Log } from '../domain/model/log'

/**
 * Interface of the log repository
 * Must be implemented by the log repository at the infrastructure layer.
 *
 * @see {@link }
 * @extends {IRepository<Log>}
 */
export interface ILogRepository extends IRepository<Log> {
    /**
     * Retrieves a log according to the parameters.
     *
     * @param childId Child id associated with log.
     * @param logType Type of the log.
     * @param dateLog Date of the log.
     * @return {Promise<Log>}
     * @throws {ValidationException | RepositoryException}
     */
    selectByChild(childId: string, logType: string, dateLog: string): Promise<Log>

    /**
     * Returns the total of logs of a child in a period by resource.
     *
     * @param childId Child id associated with logs.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countLogsByResource(childId: string, desiredResource: string, dateStart: string, dateEnd: string): Promise<number>
}
