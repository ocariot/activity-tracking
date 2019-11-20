import { IBodyFatRepository } from '../../src/application/port/body.fat.repository.interface'
import { BodyFat } from '../../src/application/domain/model/body.fat'
import { BodyFatMock } from './body.fat.mock'

export class BodyFatRepositoryMock implements IBodyFatRepository {
    public checkExist(bodyFat: BodyFat): Promise<boolean> {
        if (bodyFat.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public countByChild(childId: string): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: BodyFat): Promise<BodyFat> {
        if (item.id === '507f1f77bcf86cd799439013')
            return Promise.resolve(undefined!)
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<BodyFat>> {
        const child_id: string = query.filters.child_id
        const bodyFatArr: Array<BodyFat> = new Array<BodyFatMock>()
        // Only for the test case that returns a filled array
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                bodyFatArr.push(new BodyFatMock())
            }
        }
        return Promise.resolve(bodyFatArr)
    }

    public findOne(query: any): Promise<BodyFat> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            return Promise.resolve(new BodyFatMock())
        }
        return Promise.resolve(undefined!)
    }

    public removeAllByChild(childId: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public removeByChild(bodyFatId: string, childId: string, type: string): Promise<boolean> {
        if (bodyFatId === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public selectByChild(bodyFatTimestamp: Date, childId: string, bodyFatType: string): Promise<BodyFat> {
        if (childId === '507f1f77bcf86cd799439011') {
            return Promise.resolve(new BodyFatMock())
        }
        return Promise.resolve(undefined!)
    }

    public update(item: BodyFat): Promise<BodyFat> {
        return Promise.resolve(item)
    }
}
