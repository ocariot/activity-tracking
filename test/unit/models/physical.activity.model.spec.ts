import { ObjectID } from 'bson'
import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'

describe('Models: PhysicalActivity', () => {
    const activityJSON: any = {
        id: new ObjectID(),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 900000,
        child_id: new ObjectID(),
        name: 'walk',
        calories: 250,
        steps: 1000,
        levels: [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
                 new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
                 new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
                 new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new PhysicalActivity().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new PhysicalActivity().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an PhysicalActivity model', () => {
                const result = new PhysicalActivity().fromJSON(activityJSON)
                assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
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
                assert.typeOf(result.steps, 'number')
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                assert(result.levels, 'levels must not be undefined')
                // Level 1
                assert(result.levels![0].name, 'levels[0] name must not be undefined')
                assert(result.levels![0].duration, 'levels[0] duration must not be undefined')
                assert.propertyVal(result.levels![0], 'name', activityJSON.levels[0].name)
                assert.propertyVal(result.levels![0], 'duration', activityJSON.levels[0].duration)
                // Level 2
                assert(result.levels![1].name, 'levels[1] name must not be undefined')
                assert(result.levels![1].duration, 'levels[1] duration must not be undefined')
                assert.propertyVal(result.levels![1], 'name', activityJSON.levels[1].name)
                assert.propertyVal(result.levels![1], 'duration', activityJSON.levels[1].duration)
                // Level 3
                assert(result.levels![2].name, 'levels[2] name must not be undefined')
                assert(result.levels![2].duration, 'levels[2] duration must not be undefined')
                assert.propertyVal(result.levels![2], 'name', activityJSON.levels[2].name)
                assert.propertyVal(result.levels![2], 'duration', activityJSON.levels[2].duration)
                // Level 4
                assert(result.levels![3].name, 'levels[3] name must not be undefined')
                assert(result.levels![3].duration, 'levels[3] duration must not be undefined')
                assert.propertyVal(result.levels![3], 'name', activityJSON.levels[3].name)
                assert.propertyVal(result.levels![3], 'duration', activityJSON.levels[3].duration)
            })
        })

        context('when the json is undefined', () => {
            it('should return an PhysicalActivity model with all attributes with undefined value', () => {
                const result = new PhysicalActivity().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.start_time)
                assert.isUndefined(result.end_time)
                assert.isUndefined(result.duration)
                assert.isUndefined(result.child_id)
                assert.isUndefined(result.name)
                assert.isUndefined(result.calories)
                assert.isUndefined(result.steps)
                assert.isUndefined(result.levels)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return PhysicalActivity model', () => {
                const result = new PhysicalActivity().fromJSON(JSON.stringify(activityJSON))
                assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id.toHexString())
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activityJSON.child_id.toHexString())
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', activityJSON.name)
                assert(result.calories, 'calories must not be undefined')
                assert.typeOf(result.calories, 'number')
                assert.propertyVal(result, 'calories', activityJSON.calories)
                assert.typeOf(result.steps, 'number')
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                assert(result.levels, 'levels must not be undefined')
                // Level 1
                assert(result.levels![0].name, 'levels[0] name must not be undefined')
                assert(result.levels![0].duration, 'levels[0] duration must not be undefined')
                assert.propertyVal(result.levels![0], 'name', activityJSON.levels[0].name)
                assert.propertyVal(result.levels![0], 'duration', activityJSON.levels[0].duration)
                // Level 2
                assert(result.levels![1].name, 'levels[1] name must not be undefined')
                assert(result.levels![1].duration, 'levels[1] duration must not be undefined')
                assert.propertyVal(result.levels![1], 'name', activityJSON.levels[1].name)
                assert.propertyVal(result.levels![1], 'duration', activityJSON.levels[1].duration)
                // Level 3
                assert(result.levels![2].name, 'levels[2] name must not be undefined')
                assert(result.levels![2].duration, 'levels[2] duration must not be undefined')
                assert.propertyVal(result.levels![2], 'name', activityJSON.levels[2].name)
                assert.propertyVal(result.levels![2], 'duration', activityJSON.levels[2].duration)
                // Level 4
                assert(result.levels![3].name, 'levels[3] name must not be undefined')
                assert(result.levels![3].duration, 'levels[3] duration must not be undefined')
                assert.propertyVal(result.levels![3], 'name', activityJSON.levels[3].name)
                assert.propertyVal(result.levels![3], 'duration', activityJSON.levels[3].duration)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the PhysicalActivity model is correct', () => {
            it('should return a JSON from PhysicalActivity model', () => {
                let result = new PhysicalActivity().fromJSON(activityJSON)
                result = result.toJSON()
                assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
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
                assert.typeOf(result.steps, 'number')
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                assert(result.levels, 'levels must not be undefined')
                // Level 1
                assert(result.levels![0].name, 'levels[0] name must not be undefined')
                assert(result.levels![0].duration, 'levels[0] duration must not be undefined')
                assert.propertyVal(result.levels![0], 'name', activityJSON.levels[0].name)
                assert.propertyVal(result.levels![0], 'duration', activityJSON.levels[0].duration)
                // Level 2
                assert(result.levels![1].name, 'levels[1] name must not be undefined')
                assert(result.levels![1].duration, 'levels[1] duration must not be undefined')
                assert.propertyVal(result.levels![1], 'name', activityJSON.levels[1].name)
                assert.propertyVal(result.levels![1], 'duration', activityJSON.levels[1].duration)
                // Level 3
                assert(result.levels![2].name, 'levels[2] name must not be undefined')
                assert(result.levels![2].duration, 'levels[2] duration must not be undefined')
                assert.propertyVal(result.levels![2], 'name', activityJSON.levels[2].name)
                assert.propertyVal(result.levels![2], 'duration', activityJSON.levels[2].duration)
                // Level 4
                assert(result.levels![3].name, 'levels[3] name must not be undefined')
                assert(result.levels![3].duration, 'levels[3] duration must not be undefined')
                assert.propertyVal(result.levels![3], 'name', activityJSON.levels[3].name)
                assert.propertyVal(result.levels![3], 'duration', activityJSON.levels[3].duration)
            })
        })
    })
})
