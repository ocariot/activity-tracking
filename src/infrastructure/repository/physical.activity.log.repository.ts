import {BaseRepository} from './base/base.repository'
import {PhysicalActivityLog} from '../../application/domain/model/physical.activity.log'
import {IPhysicalActivityLogRepository} from '../../application/port/physical.activity.log.repository.interface'
import {PhysicalActivityLogEntity} from '../entity/physical.activity.log.entity'
import {inject, injectable} from 'inversify'
import {Identifier} from '../../di/identifiers'
import {IEntityMapper} from '../port/entity.mapper.interface'
import {ILogger} from '../../utils/custom.logger'

@injectable()
export class PhysicalActivityLogRepository extends BaseRepository<PhysicalActivityLog, PhysicalActivityLogEntity>
    implements IPhysicalActivityLogRepository {

    constructor(
        @inject(Identifier.ACTIVITY_LOG_REPO_MODEL) readonly activityLogModel: any,
        @inject(Identifier.ACTIVITY_LOG_ENTITY_MAPPER) readonly activityLogMapper:
            IEntityMapper<PhysicalActivityLog, PhysicalActivityLogEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(activityLogModel, activityLogMapper, logger)
    }
}
