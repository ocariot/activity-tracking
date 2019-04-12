import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { Strings } from '../../utils/strings'
import { ILogService } from '../port/log.service.interface'
import { IQuery } from '../port/query.interface'
import { Log, LogType } from '../domain/model/log'
import { ILogRepository } from '../port/log.repository.interface'
import { CreateLogValidator } from '../domain/validator/create.log.validator'
import { DateValidator } from '../domain/validator/date.validator'
import { PhysicalActivityLog } from '../domain/model/physical.activity.log'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { ConflictException } from '../domain/exception/conflict.exception'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { LogTypeValidator } from '../domain/validator/log.type.validator'

/**
 * Implementing physical activity service
 *
 * @implements {ILogService}
 */
@injectable()
export class LogService implements ILogService {

    constructor(
        @inject(Identifier.LOG_REPOSITORY) private readonly _logRepository: ILogRepository) {
    }

    /**
     * Adds a new log array.
     *
     * @param {Array<Log>} activityLogs
     * @returns {Promise<Array<Log>>}
     * @throws { RepositoryException}
     */
    public async addLogs(activityLogs: Array<Log>): Promise<MultiStatus<Log>> {
        const multiStatus: MultiStatus<Log> = new MultiStatus<Log>()
        const statusSuccessArr: Array<StatusSuccess<Log>> = new Array<StatusSuccess<Log>>()
        const statusErrorArr: Array<StatusError<Log>> = new Array<StatusError<Log>>()

        for (const elem of activityLogs) {
            try {
                // 1. Validate the object.
                CreateLogValidator.validate(elem)

                // 2. Check if it already exists in the database.
                const log = await this._logRepository.findOneByChild(elem.child_id, elem.type, elem.date)

                if (log) { // If exists.
                    // 3a. Update physical activity log.
                    log.value += elem.value
                    await this._logRepository.update(log)

                    // 4a. Creates a StatusSuccess object for the construction of the MultiStatus response.
                    const statusSuccess: StatusSuccess<Log> = new StatusSuccess<Log>(HttpStatus.CREATED, elem)
                    statusSuccessArr.push(statusSuccess)
                } else {
                    // 3b. Creates new physical activity log.
                    await this._logRepository.create(elem)

                    // 4b. Creates a StatusSuccess object for the construction of the MultiStatus response.
                    const statusSuccess: StatusSuccess<Log> = new StatusSuccess<Log>(HttpStatus.CREATED, elem)
                    statusSuccessArr.push(statusSuccess)
                }
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 4c. Creates a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Log> = new StatusError<Log>(statusCode, err.message, err.description, elem)
                statusErrorArr.push(statusError)
            }
        }

        // 5. Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        // 6. Returns the created object.
        return Promise.resolve(multiStatus)
    }

    /**
     * Get the data of all logs in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivityLog>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Log>> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Get in infrastructure the log data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivityLog>}
     * @throws {RepositoryException}
     */
    public async getById(id: string, query: IQuery): Promise<Log> {
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
    public async getByChildAndDate(childId: string, dateStart: string, dateEnd: string, query: IQuery): Promise<PhysicalActivityLog> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        DateValidator.validate(dateStart)
        DateValidator.validate(dateEnd)

        query.addFilter({
            child_id: childId,
            $and: [
                { date: { $lte: dateEnd.toString().concat('T00:00:00') } },
                { date: { $gte: dateStart.toString().concat('T00:00:00') } }
            ]
        })

        try {
            // Creates a PhysicalActivityLog object with all the resources listed with arrays.
            const physical: PhysicalActivityLog = new PhysicalActivityLog()
            const stepsArr: Array<Log> = new Array<Log>()
            const caloriesArr: Array<Log> = new Array<Log>()

            const logs: Array<Log> = await this._logRepository.find(query)
            logs.forEach(item => {
                if (item.type === 'steps') stepsArr.push(item)
                else if (item.type === 'calories') caloriesArr.push(item)
            })

            physical.steps = stepsArr
            physical.calories = caloriesArr

            return Promise.resolve(physical)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Retrieve the physical activities logs with information on the total steps or calories of a child in a given period.
     *
     * @param childId Child ID.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    public getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string,
                                     dateEnd: string, query: IQuery): Promise<Array<Log>> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        LogTypeValidator.validate(desiredResource)
        DateValidator.validate(dateStart)
        DateValidator.validate(dateEnd)

        query.addFilter({
            child_id: childId,
            type: desiredResource,
            $and: [
                { date: { $lte: dateEnd.concat('T00:00:00') } },
                { date: { $gte: dateStart.concat('T00:00:00') } }
            ]
        })

        return this._logRepository.find(query)
    }

    /**
     * Unimplemented methods.
     */
    public async add(activityLog: Log): Promise<Log> {
        throw new Error('Unsupported feature!')
    }

    public async update(activityLog: Log): Promise<Log> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
