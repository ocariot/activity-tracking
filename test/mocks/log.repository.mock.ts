import { ILogRepository } from '../../src/application/port/log.repository.interface'
import { Log, LogType } from '../../src/application/domain/model/log'
import { LogMock } from './log.mock'

export class LogRepositoryMock implements ILogRepository {

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Log): Promise<Log> {
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<Log>> {
        const logsArr: Array<Log> = new Array<Log>()
        const child_id: string = query.filters.child_id
        // Only for the test case that returns a filled PhysicalActivityLog
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            // Mock correct logs array
            for (let i = 0; i < 5; i++ ) {
                logsArr.push(new LogMock(query.filters.type))
            }
        }
        return Promise.resolve(logsArr)
    }

    public findOne(query: any): Promise<Log> {
        const date: string = query.filters.date
        if (date === '2018-03-10T00:00:00') {
            return Promise.resolve(new LogMock(query.filters.type))
        }
        return Promise.resolve(undefined!)
    }

    public update(item: Log): Promise<Log> {
        return Promise.resolve(item)
    }

    public findOneByChild(child_id: string, type: LogType, date: string): Promise<Log> {
        return Promise.resolve(new LogMock())
    }
}
