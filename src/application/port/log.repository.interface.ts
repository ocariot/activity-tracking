import { IRepository } from './repository.interface'
import { Log, LogType } from '../domain/model/log'

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
    selectByChild(childId: string, logType: LogType, dateLog: string): Promise<Log>
}
