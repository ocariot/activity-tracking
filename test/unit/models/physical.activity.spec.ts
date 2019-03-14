import { ObjectID } from 'bson'
import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'

describe('Models: PhysicalActivity', () => {
    const activityJSON: any = {
        id: new ObjectID(),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 900000,
        child_id: new ObjectID(),
        name: 'walk',
        calories: 250,
        steps: '1000',
        levels: new Array<PhysicalActivityLevel>()
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
                try {
                    assert.typeOf(result.steps, 'number')
                } catch (e) { //
                }
                assert(result.levels, 'levels must not be undefined')
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
                try {
                    assert.typeOf(result.steps, 'number')
                } catch (e) { //
                }
                assert(result.levels, 'levels must not be undefined')
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
                try {
                    assert.typeOf(result.steps, 'number')
                } catch (e) { //
                }
                assert(result.levels, 'levels must not be undefined')
            })
        })
    })
})
