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
import { ChildLog } from '../../application/domain/model/child.log'

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
     * Retrieves logs according to parameter values.
     *
     * @param childId Child id associated with logs.
     * @param dateStart Range start date.
     * @param dateEnd Range end date.
     * @param desiredResource Desired resource (it's optional).
     * @return {Promise<Array<Log>>}
     * @throws {RepositoryException}
     */
    public async findByChild(childId: string, dateStart: string, dateEnd: string,
                             desiredResource?: string): Promise<Array<Log> | ChildLog> {
        const query: IQuery = new Query()
        query.ordination = new Map<string, string>().set('date', 'desc')
        query.addFilter({
            child_id: childId,
            $and: [
                { date: { $lte: dateEnd.concat('T00:00:00') } },
                { date: { $gte: dateStart.concat('T00:00:00') } }
            ]
        })
        if (desiredResource) query.addFilter({ type: desiredResource })
        const q: any = query.toJSON()
        return new Promise<Array<Log> | ChildLog>((resolve, reject) => {
            this.Model.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .exec() // execute query
                .then((result: Array<LogEntity>) => {
                    const logsFind: Array<Log> = result.map(item => this.mapper.transform(item))
                    if (desiredResource) resolve(this.createLogsArrayInRange(childId, desiredResource, dateStart, dateEnd, logsFind))
                    else {
                        // Creates a ChildLog object with all the resources listed with arrays.
                        const childLog: ChildLog = new ChildLog()
                        const stepsArr: Array<Log> = new Array<Log>()
                        const caloriesArr: Array<Log> = new Array<Log>()
                        const activeMinutesArr: Array<Log> = new Array<Log>()
                        const lightlyActiveMinutesArr: Array<Log> = new Array<Log>()
                        const sedentaryMinutesArr: Array<Log> = new Array<Log>()

                        logsFind.forEach(item => {
                            if (item.type === LogType.STEPS) stepsArr.push(item)
                            else if (item.type === LogType.CALORIES) caloriesArr.push(item)
                            else if (item.type === LogType.ACTIVE_MINUTES) activeMinutesArr.push(item)
                            else if (item.type === LogType.LIGHTLY_ACTIVE_MINUTES) lightlyActiveMinutesArr.push(item)
                            else if (item.type === LogType.SEDENTARY_MINUTES) sedentaryMinutesArr.push(item)
                        })

                        childLog.steps = this.createLogsArrayInRange(childId, LogType.STEPS, dateStart, dateEnd, stepsArr)
                        childLog.calories = this.createLogsArrayInRange(childId, LogType.CALORIES, dateStart, dateEnd, caloriesArr)
                        childLog.active_minutes = this.createLogsArrayInRange(
                            childId, LogType.ACTIVE_MINUTES, dateStart, dateEnd, activeMinutesArr)
                        childLog.lightly_active_minutes = this.createLogsArrayInRange(
                            childId, LogType.LIGHTLY_ACTIVE_MINUTES, dateStart, dateEnd, lightlyActiveMinutesArr)
                        childLog.sedentary_minutes = this.createLogsArrayInRange(
                            childId, LogType.SEDENTARY_MINUTES, dateStart, dateEnd, sedentaryMinutesArr)

                        resolve(childLog)
                    }
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all logs associated with the childId received.
     *
     * @param childId Child id associated with logs.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllLogsFromChild(childId: string): Promise<boolean> {
        // Creates the query with the received parameter
        const query: IQuery = new Query()
        query.filters = { child_id: childId }

        return new Promise<boolean>((resolve, reject) => {
            this.logModel.deleteMany(query.filters)
                .then(result => {
                    if (!result) return resolve(false)
                    return resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
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
            log.date = `${date_start.getUTCFullYear()}-${month_date_start}-${day_date_start}`
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
