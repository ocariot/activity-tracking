import { IRepository } from './repository.interface'
import { Log } from '../domain/model/log'
import { ChildLog } from '../domain/model/child.log'

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
     * Retrieves logs according to parameter values.
     *
     * @param childId Child id associated with logs.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param desiredResource Desired resource (it's optional).
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    findByChild(childId: string, dateStart: string, dateEnd: string,
                desiredResource?: string): Promise<Array<Log> | ChildLog>

    /**
     * Removes all logs associated with the childId received.
     *
     * @param childId Child id associated with logs.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeAllByChild(childId: string): Promise<boolean>
}
