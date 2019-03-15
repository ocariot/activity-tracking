import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Activity } from '../../../src/application/domain/model/activity'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'

describe('Models: Activity', () => {
    const activityJSON: any = {
        id: new ObjectID(),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 900000,
        child_id: new ObjectID()
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Activity().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Activity().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Activity model', () => {
                const result = new Activity().fromJSON(activityJSON)
                assert(result.id, 'Activity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activityJSON.child_id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Activity model with all attributes with undefined value', () => {
                const result = new Activity().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.start_time)
                assert.isUndefined(result.end_time)
                assert.isUndefined(result.duration)
                assert.isUndefined(result.child_id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Activity model', () => {
                const result = new Activity().fromJSON(JSON.stringify(activityJSON))
                assert(result.id, 'Activity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id.toHexString())
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activityJSON.child_id.toHexString())
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Activity model is correct', () => {
            it('should return a JSON from Activity model', () => {
                let result = new Activity().fromJSON(activityJSON)
                result = result.toJSON()
                assert(result.id, 'Activity id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', activityJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', activityJSON.child_id)
            })
        })
    })
})
