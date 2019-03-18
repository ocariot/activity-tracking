import { ILogRepository } from '../../src/application/port/log.repository.interface'
import { Log } from '../../src/application/domain/model/log'
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
        const child_id: string = query.filters.child_id
        const sleepArr: Array<Log> = new Array<Log>()
        // Only for the test case that returns a filled array
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                sleepArr.push(LogMock.generateLog())
            }
        }
        return Promise.resolve(sleepArr)
    }

    public findOne(query: any): Promise<Log> {
        const date: string = query.filters.date
        if (date === '2018-03-10T00:00:00') {
            return Promise.resolve(LogMock.generateLog())
        }
        return Promise.resolve(undefined!)
    }

    public update(item: Log): Promise<Log> {
        return Promise.resolve(item)
    }

}
