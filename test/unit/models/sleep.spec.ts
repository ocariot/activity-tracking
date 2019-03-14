import { ObjectID } from 'bson'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'

describe('Models: Sleep', () => {
    const sleepJSON: any = {
        id: new ObjectID(),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 900000,
        child_id: new ObjectID(),
        pattern: new SleepPattern()
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Sleep().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Sleep().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Sleep model', () => {
                const result = new Sleep().fromJSON(sleepJSON)
                assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                assert(result.pattern, 'pattern must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an Sleep model with all attributes with undefined value', () => {
                const result = new Sleep().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.start_time)
                assert.isUndefined(result.end_time)
                assert.isUndefined(result.duration)
                assert.isUndefined(result.child_id)
                assert.isUndefined(result.pattern)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Sleep model', () => {
                const result = new Sleep().fromJSON(JSON.stringify(sleepJSON))
                assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', sleepJSON.id.toHexString())
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', sleepJSON.child_id.toHexString())
                assert(result.pattern, 'pattern must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Sleep model is correct', () => {
            it('should return a JSON from Sleep model', () => {
                let result = new Sleep().fromJSON(sleepJSON)
                result = result.toJSON()
                assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.end_time, 'end_time must not be undefined')
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                assert(result.pattern, 'pattern must not be undefined')
            })
        })
    })
})
