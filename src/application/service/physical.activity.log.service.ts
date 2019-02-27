import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { Strings } from '../../utils/strings'
import { UuidValidator } from '../domain/validator/uuid.validator'
import { IPhysicalActivityLogService } from '../port/physical.activity.log.service.interface'
import { IQuery } from '../port/query.interface'
import { PhysicalActivityLog } from 'application/domain/model/physical.activity.log'
// import { IPhysicalActivityLogRepository } from '../port/physical.activity.log.repository.interface'
import { Log, LogType } from '../domain/model/log'
import { ILogRepository } from '../port/log.repository.interface'
import { CreatePhysicalActivityLogValidator } from '../domain/validator/create.physical.activity.log.validator'
import { DatelogValidator } from '../domain/validator/datelog.validator'
import { Query } from '../../infrastructure/repository/query/query'

/**
 * Implementing physicalactivitylog service
 *
 * @implements {IPhysicalActivityLogService}
 */
@injectable()
export class PhysicalActivityLogService implements IPhysicalActivityLogService {

    constructor(
        // @inject(Identifier.ACTIVITY_LOG_REPOSITORY) private readonly _activityLogRepository: IPhysicalActivityLogRepository,
        @inject(Identifier.LOG_REPOSITORY) private readonly _logRepository: ILogRepository) {
    }

    /**
     * Adds a new log array.
     *
     * @param {Array<Log>} activityLogs
     * @returns {(Promise<Array<Log>>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing physicalactivitylog.
     */
    public async addLogs(activityLogs: Array<Log>): Promise<Array<Log>> {
        try {
            activityLogs.forEach(async (elem) => {
                try {
                    // 1. Validate the object.
                    CreatePhysicalActivityLogValidator.validate(elem)

                    // 2. Build a query
                    const query: IQuery = new Query()
                    query.filters = {
                        type: elem.type,
                        date: elem.date.concat('T00:00:00')
                    }

                    // 3. Check if it already exists in the database
                    const log = await this._logRepository.findOne(query)

                    if (log) { // If exists
                        // 4a. Update physical activity log.
                        elem.value += log.value
                        await this._logRepository.update(elem)
                    }
                    else {
                        // 4b. Create new physical activity log.
                        await this._logRepository.create(elem)
                    }
                } catch (err) {
                    console.log('Deu erro', err.message)
                }
            })

            // 3. Returns the created object.
            return Promise.resolve(activityLogs)
        } catch (err) {
            return Promise.reject(err)
        }
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
    public async getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery): Promise<Array<Log>> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        DatelogValidator.validate(dateStart.toString())
        DatelogValidator.validate(dateEnd.toString())

        query.addFilter({
            child_id: childId,
            $and: [
                { date: { $lte: dateEnd.toString().concat('T00:00:00') } },
                { date: { $gte: dateStart.toString().concat('T00:00:00') } }
            ]
        })

        return this._logRepository.find(query)
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
    public getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: Date,
                                     dateEnd: Date, query: IQuery): Promise<Array<Log>> {
        UuidValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        DatelogValidator.validate(dateStart.toString())
        DatelogValidator.validate(dateEnd.toString())

        query.addFilter({
            child_id: childId,
            type: desiredResource,
            $and: [
                { date: { $lte: dateEnd.toString().concat('T00:00:00') } },
                { date: { $gte: dateStart.toString().concat('T00:00:00') } }
            ]
        })
        return this._logRepository.find(query)
    }

    /**
     * Unimplemented methods
     */
    public async add(activityLog: PhysicalActivityLog): Promise<PhysicalActivityLog> {
        throw new Error('Unsupported feature!')
    }

    public async update(physicalActivityLog: PhysicalActivityLog): Promise<PhysicalActivityLog> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
