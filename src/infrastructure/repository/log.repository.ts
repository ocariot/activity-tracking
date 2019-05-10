import { BaseRepository } from './base/base.repository'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Log, LogType } from '../../application/domain/model/log'
import { LogEntity } from '../entity/log.entity'
import { ILogRepository } from '../../application/port/log.repository.interface'
import { Query } from './query/query'
import { IQuery } from '../../application/port/query.interface'

@injectable()
export class LogRepository extends BaseRepository<Log, LogEntity>
    implements ILogRepository {

    constructor(
        @inject(Identifier.ACTIVITY_LOG_REPO_MODEL) readonly logModel: any,
        @inject(Identifier.LOG_ENTITY_MAPPER) readonly logMapper:
            IEntityMapper<Log, LogEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(logModel, logMapper, logger)
    }

    /**
     * Retrieves a log according to the parameters.
     *
     * @param childId Child id associated with log.
     * @param logType Type of the log.
     * @param dateLog Date of the log.
     * @return {Promise<Log>}
     * @throws {ValidationException | RepositoryException}
     */
    public async findOneByChild(childId: string, logType: LogType, dateLog: string): Promise<Log> {
        // Creates the query with the received parameters
        const query: IQuery = new Query()
        query.filters = {
            child_id: childId,
            type: logType,
            date: dateLog.concat('T00:00:00')
        }

        return new Promise<Log>((resolve, reject) => {
            this.Model.findOne(query.filters)
                .select(query.fields)
                .exec()
                .then((result: Log) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.logMapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
