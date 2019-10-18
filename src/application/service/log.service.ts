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
import { ChildLog } from '../domain/model/child.log'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { LogTypeValidator } from '../domain/validator/log.type.validator'
import { LogDateRangeValidator } from '../domain/validator/log.date.range.validator'

/**
 * Implementing log service
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
     * @param {Array<Log>} logs
     * @returns {Promise<MultiStatus<Log>>}
     * @throws {ValidationException | RepositoryException}
     */
    public async addLogs(logs: Array<Log>): Promise<MultiStatus<Log>> {
        const multiStatus: MultiStatus<Log> = new MultiStatus<Log>()
        const statusSuccessArr: Array<StatusSuccess<Log>> = new Array<StatusSuccess<Log>>()
        const statusErrorArr: Array<StatusError<Log>> = new Array<StatusError<Log>>()

        for (const elem of logs) {
            try {
                // 1. Validate the object.
                CreateLogValidator.validate(elem)

                // 2. Check if it already exists in the database.
                const log = await this._logRepository.selectByChild(elem.child_id, elem.type, elem.date)

                if (log) { // If exists.
                    // 3a. Update child log.
                    log.value = elem.value
                    const logResult = await this._logRepository.update(log)

                    // 4a. Creates a StatusSuccess object for the construction of the MultiStatus response.
                    const statusSuccess: StatusSuccess<Log> = new StatusSuccess<Log>(HttpStatus.CREATED, logResult)
                    statusSuccessArr.push(statusSuccess)
                } else {
                    // 3b. Creates new child log.
                    const logResult = await this._logRepository.create(elem)

                    // 4b. Creates a StatusSuccess object for the construction of the MultiStatus response.
                    const statusSuccess: StatusSuccess<Log> = new StatusSuccess<Log>(HttpStatus.CREATED, logResult)
                    statusSuccessArr.push(statusSuccess)
                }
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST

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
     * @return {Promise<Array<Log>>}
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
     * @return {Promise<Log>}
     * @throws {RepositoryException}
     */
    public async getById(id: string, query: IQuery): Promise<Log> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve the child logs with information on the total steps, calories, activeMinutes and sedentaryMinutes
     * of a child in a given period.
     *
     * @param childId Child ID.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<ChildLog>}
     * @throws {RepositoryException}
     */
    public async getByChildAndDate(childId: string, dateStart: string, dateEnd: string, query: IQuery): Promise<ChildLog> {
        try {
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            DateValidator.validate(dateStart)
            DateValidator.validate(dateEnd)
            LogDateRangeValidator.validate(dateStart, dateEnd)

            // Creates a ChildLog object with all the resources listed with arrays.
            const childLog: ChildLog = new ChildLog()
            const stepsArr: Array<Log> = new Array<Log>()
            const caloriesArr: Array<Log> = new Array<Log>()
            const activeMinutesArr: Array<Log> = new Array<Log>()
            const lightlyActiveMinutesArr: Array<Log> = new Array<Log>()
            const sedentaryMinutesArr: Array<Log> = new Array<Log>()

            const logs: Array<Log> = await this._logRepository.find(query)
            logs.forEach(item => {
                if (item.type === LogType.STEPS) stepsArr.push(item)
                else if (item.type === LogType.CALORIES) caloriesArr.push(item)
                else if (item.type === LogType.ACTIVE_MINUTES) activeMinutesArr.push(item)
                else if (item.type === LogType.LIGHTLY_ACTIVE_MINUTES) lightlyActiveMinutesArr.push(item)
                else if (item.type === LogType.SEDENTARY_MINUTES) sedentaryMinutesArr.push(item)
            })

            childLog.steps = this.createLogsArrayInRange(childId, LogType.STEPS, dateStart, dateEnd, stepsArr)
            childLog.calories = this.createLogsArrayInRange(childId, LogType.CALORIES, dateStart, dateEnd, caloriesArr)
            childLog.active_minutes =
                this.createLogsArrayInRange(childId, LogType.ACTIVE_MINUTES, dateStart, dateEnd, activeMinutesArr)
            childLog.lightly_active_minutes =
                this.createLogsArrayInRange(childId, LogType.LIGHTLY_ACTIVE_MINUTES, dateStart, dateEnd, lightlyActiveMinutesArr)
            childLog.sedentary_minutes =
                this.createLogsArrayInRange(childId, LogType.SEDENTARY_MINUTES, dateStart, dateEnd, sedentaryMinutesArr)

            return Promise.resolve(childLog)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Retrieve the child logs with information on the total steps, calories, activeMinutes or sedentaryMinutes
     * of a child in a given period.
     *
     * @param childId Child ID.
     * @param desiredResource Desired resource.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    public async getByChildResourceAndDate(childId: string, desiredResource: string, dateStart: string,
                                           dateEnd: string, query: IQuery): Promise<Array<Log>> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        LogTypeValidator.validate(desiredResource)
        DateValidator.validate(dateStart)
        DateValidator.validate(dateEnd)
        LogDateRangeValidator.validate(dateStart, dateEnd)

        const logsFind: Array<Log> = await this._logRepository.find(query)
        const totalLogs: Array<Log> = this.createLogsArrayInRange(childId, desiredResource, dateStart, dateEnd, logsFind)

        return Promise.resolve(totalLogs)
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

    private createLogsArrayInRange(childId: string, desiredResource: string, dateStart: string, dateEnd: string,
                                   logsFind: Array<Log>): Array<Log> {
        const logsInRange: Array<Log> = []
        const dateEndMilli: number = new Date(dateEnd).getTime()
        let dateStartMilli: number = new Date(dateStart).getTime()
        let date_start: Date = new Date(dateStart)

        while (dateStartMilli <= dateEndMilli) {
            let month_date_start: string = String(date_start.getUTCMonth() + 1)
            if (month_date_start.length === 1) month_date_start = month_date_start.padStart(2, '0')

            let day_date_start: string = String(date_start.getUTCDate())
            if (day_date_start.length === 1) day_date_start = day_date_start.padStart(2, '0')

            const log: Log = new Log()
            log.date = `${date_start.getFullYear()}-${month_date_start}-${day_date_start}`
            log.value = 0
            log.type = desiredResource
            log.child_id = childId
            logsInRange.push(log)

            dateStartMilli += 86400000      // Increment one day
            date_start = new Date(dateStartMilli)       // Create a new date for the next iteration
        }

        for (const log of logsFind) {
            const index = logsInRange.findIndex(item => item.date === log.date)
            if (index !== -1) logsInRange[index].value = log.value
        }

        return logsInRange
    }
}
