import { assert } from 'chai'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.entity.mapper'

describe('Mappers: PhysicalActivityEntity', () => {
    const activity: PhysicalActivity = new PhysicalActivity()
    activity.id = '5a62be07de34500146d9c544'
    activity.start_time = new Date('2018-08-18T01:40:30Z')
    activity.end_time = new Date('2018-08-18T09:52:30Z')
    activity.duration = 1178000
    activity.child_id = '5a62be07de34500146d9c544'
    activity.name = 'walk'
    activity.calories = 200
    activity.steps = 1000
    activity.levels = [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
        new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
        new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
        new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]

    // Create physical activity JSON
    const activityJSON: any = {
        id: '5a62be07de34500146d9c544',
        start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
        end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
        duration: 1178000,
        child_id: '5a62be07de34500146d9c544',
        name: 'walk',
        calories: 200,
        steps: 1000,
        levels: [
            {
                name: 'sedentary',
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: 'lightly',
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: 'fairly',
                duration: Math.floor((Math.random() * 10) * 60000)
            },
            {
                name: 'very',
                duration: Math.floor((Math.random() * 10) * 60000)
            }
        ]
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type PhysicalActivity', () => {
            it('should normally execute the method, returning a PhysicalActivityEntity as a result of the transformation', () => {
                const result = new PhysicalActivityEntityMapper().transform(activity)
                assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activity.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert.propertyVal(result, 'start_time', activity.start_time)
                assert(result.end_time, 'end_time must not be undefined')
                assert.propertyVal(result, 'end_time', activity.end_time)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activity.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activity.child_id)
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', activity.name)
                assert(result.calories, 'calories must not be undefined')
                assert.typeOf(result.calories, 'number')
                assert.propertyVal(result, 'calories', activity.calories)
                try {
                    assert.typeOf(result.steps, 'number')
                    assert.propertyVal(result, 'steps', activity.steps)
                } catch (e) { //
                }
                assert(result.levels, 'levels must not be undefined')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a JSON as a result of the transformation', () => {
                const result = new PhysicalActivityEntityMapper().transform(activityJSON)
                assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert.propertyVal(result, 'start_time', activityJSON.start_time)
                assert(result.end_time, 'end_time must not be undefined')
                assert.propertyVal(result, 'end_time', activityJSON.end_time)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activityJSON.child_id)
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', activityJSON.name)
                assert(result.calories, 'calories must not be undefined')
                assert.typeOf(result.calories, 'number')
                assert.propertyVal(result, 'calories', activityJSON.calories)
                try {
                    assert.typeOf(result.steps, 'number')
                    assert.propertyVal(result, 'steps', activityJSON.steps)
                } catch (e) { //
                }
                assert(result.levels, 'levels must not be undefined')
            })
        })
    })
})
