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
}
