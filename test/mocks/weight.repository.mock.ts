import { IWeightRepository } from '../../src/application/port/weight.repository.interface'
import { Weight } from '../../src/application/domain/model/weight'
import { WeightMock } from './weight.mock'

export class WeightRepositoryMock implements IWeightRepository {
    public checkExist(weight: Weight): Promise<boolean> {
        if (weight.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public countWeights(childId: string): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Weight): Promise<Weight> {
        if (item.id === '507f1f77bcf86cd799439013')
            return Promise.resolve(undefined!)
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public disassociateBodyFat(weightId: string): Promise<boolean> {
        if (weightId === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public find(query: any): Promise<Array<Weight>> {
        const child_id: string = query.filters.child_id
        const weightFatArr: Array<Weight> = new Array<WeightMock>()
        // Only for the test case that returns a filled array
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                weightFatArr.push(new WeightMock())
            }
        }
        return Promise.resolve(weightFatArr)
    }

    public findOne(query: any): Promise<Weight> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            return Promise.resolve(new WeightMock())
        }
        return Promise.resolve(undefined!)
    }

    public removeAllWeightFromChild(childId: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public removeByChild(weightId: string, childId: string, measurementType: string): Promise<boolean> {
        if (weightId === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public update(item: Weight): Promise<Weight> {
        return Promise.resolve(item)
    }
}
