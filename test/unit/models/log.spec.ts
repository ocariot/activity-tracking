import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Log, LogType } from '../../../src/application/domain/model/log'

describe('Models: Log', () => {
    const logJSON: any = {
        date: '2019-03-11',
        value: 200,
        type: LogType.CALORIES,
        child_id: new ObjectID()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an Log model', () => {
                const result = new Log().fromJSON(logJSON)
                assert(result.date, 'date must not be undefined')
                assert.typeOf(result.date, 'string')
                assert.propertyVal(result, 'date', logJSON.date)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', logJSON.value)
                assert(result.type, 'type must not be undefined')
                assert.typeOf(result.type, 'string')
                assert.propertyVal(result, 'type', logJSON.type)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', logJSON.child_id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Log model with all attributes with undefined value', () => {
                const result = new Log().fromJSON(undefined)
                assert.isUndefined(result.date)
                assert.isUndefined(result.value)
                assert.isUndefined(result.type)
                assert.isUndefined(result.child_id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Log model', () => {
                const result = new Log().fromJSON(JSON.stringify(logJSON))
                assert(result.date, 'date must not be undefined')
                assert.typeOf(result.date, 'string')
                assert.propertyVal(result, 'date', logJSON.date)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', logJSON.value)
                assert(result.type, 'type must not be undefined')
                assert.typeOf(result.type, 'string')
                assert.propertyVal(result, 'type', logJSON.type)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', logJSON.child_id.toHexString())
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Log model is correct', () => {
            it('should return a JSON from Log model', () => {
                let result = new Log().fromJSON(logJSON)
                result = result.toJSON()
                assert(result.date, 'date must not be undefined')
                assert.typeOf(result.date, 'string')
                assert.propertyVal(result, 'date', logJSON.date)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', logJSON.value)
            })
        })
    })
})
