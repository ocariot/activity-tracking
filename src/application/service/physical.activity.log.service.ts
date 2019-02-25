import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { Strings } from '../../utils/strings'
import { UuidValidator } from '../domain/validator/uuid.validator'
import { IPhysicalActivityLogService } from '../port/physical.activity.log.service.interface'
import { IQuery } from '../port/query.interface'
import { PhysicalActivityLog, PhysicalActivityLogType } from 'application/domain/model/physical.activity.log'
import { IPhysicalActivityLogRepository } from '../port/physical.activity.log.repository.interface'
import { Log } from '../domain/model/log'
import { DatetimeValidator } from '../domain/validator/datetime.validator'
import { ILogRepository } from '../port/log.repository.interface'

/**
 * Implementing physicalactivitylog service
 *
 * @implements {IPhysicalActivityLogService}
 */
@injectable()
export class PhysicalActivityLogService implements IPhysicalActivityLogService {

    constructor(
        @inject(Identifier.ACTIVITY_LOG_REPOSITORY) private readonly _activityLogRepository: IPhysicalActivityLogRepository,
        @inject(Identifier.LOG_REPOSITORY) private readonly _logRepository: ILogRepository) {
    }

    /**
     * Adds a new physicalactivitylog.
     *
     * @param {PhysicalActivityLog} activityLog
     * @returns {(Promise<PhysicalActivityLog>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing physicalactivitylog.
     */
    public async add(activityLog: PhysicalActivityLog): Promise<PhysicalActivityLog> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get the data of all physicalactivitylog in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivityLog>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<PhysicalActivityLog>> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get in infrastructure the physicalactivitylog data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivityLog>}
     * @throws {RepositoryException}
     */
    public async getById(id: string, query: IQuery): Promise<PhysicalActivityLog> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve the physical activities logs with information on the total steps and calories of a child in a given period.
     *
     * @param childId Child ID.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivityLog>}
     * @throws {RepositoryException}
     */
    public getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery): Promise<PhysicalActivityLog> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        DatetimeValidator.validateDateLog(dateStart.toString(), dateEnd.toString())

        query.addFilter({
            child_id: childId,
            $and: [
                { date: { $lte: dateEnd } },
                { date: { $gte: dateStart } }
            ]
        })
        return this._activityLogRepository.findOne(query)
    }

    /**
     * Retrieve the physical activities logs with information on the total steps or calories of a child in a given period
     *
     * @param childId Child ID.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    public getByChildResourceAndDate(childId: string, desiredResource: PhysicalActivityLogType, dateStart: Date,
                                     dateEnd: Date, query: IQuery): Promise<Array<Log>> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        DatetimeValidator.validateDateLog(dateStart.toString(), dateEnd.toString())

        query.addFilter({
            child_id: childId,
            type: desiredResource,
            $and: [
                { date: { $lte: dateEnd } },
                { date: { $gte: dateStart } }
            ]
        })
        return this._logRepository.find(query)
    }

    public async update(physicalActivityLog: PhysicalActivityLog): Promise<PhysicalActivityLog> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
