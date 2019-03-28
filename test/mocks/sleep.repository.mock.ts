import { ISleepRepository } from '../../src/application/port/sleep.repository.interface'
import { Sleep } from '../../src/application/domain/model/sleep'
import { SleepMock } from './sleep.mock'

export class SleepRepositoryMock implements ISleepRepository {
    public checkExist(sleep: Sleep): Promise<boolean> {
        if (sleep.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Sleep): Promise<Sleep> {
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<Sleep>> {
        const child_id: string = query.filters.child_id
        const sleepArr: Array<Sleep> = new Array<SleepMock>()
        // Only for the test case that returns a filled array
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                sleepArr.push(new SleepMock())
            }
        }
        return Promise.resolve(sleepArr)
    }

    public findOne(query: any): Promise<Sleep> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            return Promise.resolve(new SleepMock())
        }
        return Promise.resolve(undefined!)
    }

    public removeByChild(sleepId: string, childId: string): Promise<boolean> {
        if (sleepId === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public update(item: Sleep): Promise<Sleep> {
        return Promise.resolve(item)
    }

    public updateByChild(sleep: Sleep): Promise<Sleep> {
        if (sleep.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(sleep)
        return Promise.resolve(undefined!)
    }
}
