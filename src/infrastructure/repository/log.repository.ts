import {BaseRepository} from './base/base.repository'
import {inject, injectable} from 'inversify'
import {Identifier} from '../../di/identifiers'
import {IEntityMapper} from '../port/entity.mapper.interface'
import {ILogger} from '../../utils/custom.logger'
import { Log } from '../../application/domain/model/log'
import { LogEntity } from '../entity/log.entity'
import { ILogRepository } from '../../application/port/log.repository.interface'

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
}
