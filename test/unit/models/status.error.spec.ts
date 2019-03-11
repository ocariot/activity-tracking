import { assert } from 'chai'
import { ObjectID } from 'bson'
import { StatusError } from '../../../src/application/domain/model/status.error'
import HttpStatus from 'http-status-codes'
import { Log, LogType } from '../../../src/application/domain/model/log'

describe('Models: StatusError', () => {
    const statusErrorJSON: any = {
        code: (HttpStatus.BAD_REQUEST).toString(),
        message: 'Invalid Request',
        description: 'Request can not be met, syntactically incorrect or violates the schema. ' +
                    'Normally it occurs due to validation issues, such as fields that are expected in the ' +
                    'request body and not passed.',
        item: new Log('20199-03-11', 1000, LogType.STEPS, new ObjectID().toHexString())
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an StatusError model', () => {
                const result = new StatusError().fromJSON(statusErrorJSON)
                assert(result.code, 'code must not be undefined')
                assert.typeOf(result.code, 'string')
                assert.propertyVal(result, 'code', statusErrorJSON.code)
                assert(result.message, 'message must not be undefined')
                assert.typeOf(result.message, 'string')
                assert.propertyVal(result, 'message', statusErrorJSON.message)
                assert(result.description, 'description must not be undefined')
                assert.typeOf(result.description, 'string')
                assert.propertyVal(result, 'description', statusErrorJSON.description)
                assert(result.item, 'item must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an StatusError model with all attributes with undefined value', () => {
                const result = new StatusError().fromJSON(undefined)
                assert.isUndefined(result.code)
                assert.isUndefined(result.message)
                assert.isUndefined(result.description)
                assert.isUndefined(result.item)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return StatusError model', () => {
                const result = new StatusError().fromJSON(JSON.stringify(statusErrorJSON))
                assert(result.code, 'code must not be undefined')
                assert.typeOf(result.code, 'string')
                assert.propertyVal(result, 'code', statusErrorJSON.code)
                assert(result.message, 'message must not be undefined')
                assert.typeOf(result.message, 'string')
                assert.propertyVal(result, 'message', statusErrorJSON.message)
                assert(result.description, 'description must not be undefined')
                assert.typeOf(result.description, 'string')
                assert.propertyVal(result, 'description', statusErrorJSON.description)
                assert(result.item, 'item must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from StatusError model', () => {
            let result = new StatusError().fromJSON(statusErrorJSON)
            result = result.toJSON()
            assert(result.code, 'code must not be undefined')
            assert.typeOf(result.code, 'string')
            assert.propertyVal(result, 'code', statusErrorJSON.code)
            assert(result.message, 'message must not be undefined')
            assert.typeOf(result.message, 'string')
            assert.propertyVal(result, 'message', statusErrorJSON.message)
            assert(result.description, 'description must not be undefined')
            assert.typeOf(result.description, 'string')
            assert.propertyVal(result, 'description', statusErrorJSON.description)
            assert(result.item, 'item must not be undefined')
        })
    })
})
