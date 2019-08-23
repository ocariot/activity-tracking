import { BaseRepository } from './base/base.repository'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Log } from '../../application/domain/model/log'
import { LogEntity } from '../entity/log.entity'
import { ILogRepository } from '../../application/port/log.repository.interface'
import { Query } from './query/query'
import { IQuery } from '../../application/port/query.interface'

@injectable()
export class LogRepository extends BaseRepository<Log, LogEntity>
    implements ILogRepository {

    constructor(
        @inject(Identifier.LOG_REPO_MODEL) readonly logModel: any,
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
    public async selectByChild(childId: string, logType: string, dateLog: string): Promise<Log> {
        // Creates the query with the received parameters
        const query: IQuery = new Query()
        query.filters = {
            child_id: childId,
            type: logType,
            date: dateLog.concat('T00:00:00')
        }

        return new Promise<Log>((resolve, reject) => {
            this.logModel.findOne(query.filters)
                .exec()
                .then((result: Log) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.logMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Returns the total of logs of a child in a period by resource.
     *
     * @param childId Child id associated with physical activities.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    public countLogsByResource(childId: string, desiredResource: string, dateStart: string, dateEnd: string): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { child_id: childId, type: desiredResource,
                $and: [
                    { date: { $lte: dateEnd.concat('T00:00:00') } },
                    { date: { $gte: dateStart.concat('T00:00:00') } }
                ] } }))
    }
}
