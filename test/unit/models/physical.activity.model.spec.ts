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
                assert.propertyVal(result, 'id', activityJSON.id)
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert.propertyVal(result, 'child_id', activityJSON.child_id)
                assert.propertyVal(result, 'name', activityJSON.name)
                assert.propertyVal(result, 'calories', activityJSON.calories)
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                assert.deepPropertyVal(result, 'levels', activityJSON.levels)
                assert.deepPropertyVal(result, 'heart_rate', activityJSON.heart_rate)
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
                assert.isUndefined(result.heart_rate)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return PhysicalActivity model', () => {
                const result = new PhysicalActivity().fromJSON(JSON.stringify(activityJSON))
                assert.propertyVal(result, 'id', activityJSON.id.toHexString())
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert.propertyVal(result, 'child_id', activityJSON.child_id.toHexString())
                assert.propertyVal(result, 'name', activityJSON.name)
                assert.propertyVal(result, 'calories', activityJSON.calories)
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                assert.deepPropertyVal(result, 'levels', activityJSON.levels)
                assert.deepPropertyVal(result, 'heart_rate', activityJSON.heart_rate)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the PhysicalActivity model is correct', () => {
            it('should return a JSON from PhysicalActivity model', () => {
                let result = new PhysicalActivity().fromJSON(activityJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', activityJSON.id)
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert.propertyVal(result, 'child_id', activityJSON.child_id)
                assert.propertyVal(result, 'name', activityJSON.name)
                assert.propertyVal(result, 'calories', activityJSON.calories)
                assert.propertyVal(result, 'steps', activityJSON.steps)
                // PhysicalActivity levels
                // Level 1
                assert.propertyVal(result.levels![0], 'name', activityJSON.levels[0].name)
                assert.propertyVal(result.levels![0], 'duration', activityJSON.levels[0].duration)
                // Level 2
                assert.propertyVal(result.levels![1], 'name', activityJSON.levels[1].name)
                assert.propertyVal(result.levels![1], 'duration', activityJSON.levels[1].duration)
                // Level 3
                assert.propertyVal(result.levels![2], 'name', activityJSON.levels[2].name)
                assert.propertyVal(result.levels![2], 'duration', activityJSON.levels[2].duration)
                // Level 4
                assert.propertyVal(result.levels![3], 'name', activityJSON.levels[3].name)
                assert.propertyVal(result.levels![3], 'duration', activityJSON.levels[3].duration)
                assert.propertyVal(result, 'heart_rate', activityJSON.heart_rate)
            })
        })
    })
})
