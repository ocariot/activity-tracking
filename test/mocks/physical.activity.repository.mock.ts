import { IPhysicalActivityRepository } from '../../src/application/port/physical.activity.repository.interface'
import { PhysicalActivity } from '../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from './physical.activity.mock'

export class PhysicalActivityRepositoryMock implements IPhysicalActivityRepository {
    public checkExist(activity: PhysicalActivity): Promise<boolean> {
        if (activity.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: PhysicalActivity): Promise<PhysicalActivity> {
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<PhysicalActivity>> {
        const child_id: string = query.filters.child_id
        const activitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
        // Only for the test case that returns a filled array
        if (!(child_id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                activitiesArr.push(new PhysicalActivityMock())
            }
        }
        return Promise.resolve(activitiesArr)
    }

    public findOne(query: any): Promise<PhysicalActivity> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            return Promise.resolve(new PhysicalActivityMock())
        }
        return Promise.resolve(undefined!)
    }

    public removeByChild(activityId: string, childId: string): Promise<boolean> {
        if (activityId === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public update(item: PhysicalActivity): Promise<PhysicalActivity> {
        return Promise.resolve(item)
    }

    public updateByChild(activity: PhysicalActivity): Promise<PhysicalActivity> {
        if (activity.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(activity)
        return Promise.resolve(undefined!)
    }
}
