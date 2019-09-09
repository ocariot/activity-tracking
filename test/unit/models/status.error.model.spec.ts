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

    describe('toJSON()', () => {
        context('when the StatusError model is correct', () => {
            it('should return a JSON from StatusError model', () => {
                let result =
                    new StatusError(statusErrorJSON.code, statusErrorJSON.message, statusErrorJSON.description, statusErrorJSON.item)
                result = result.toJSON()
                assert.propertyVal(result, 'code', statusErrorJSON.code)
                assert.propertyVal(result, 'message', statusErrorJSON.message)
                assert.propertyVal(result, 'description', statusErrorJSON.description)
                assert.propertyVal(result.item, 'date', statusErrorJSON.item.date)
                assert.propertyVal(result.item, 'value', statusErrorJSON.item.value)
                assert.propertyVal(result.item, 'type', statusErrorJSON.item.type)
                assert.propertyVal(result.item, 'child_id', statusErrorJSON.item.child_id)
            })
        })

        context('when the StatusError model is empty', () => {
            it('should return a JSON from StatusError model with undefined as the value of all attributes', () => {
                let result = new StatusError()
                result = result.toJSON()
                assert.propertyVal(result, 'code', undefined)
                assert.propertyVal(result, 'message', undefined)
                assert.propertyVal(result, 'description', undefined)
                assert.propertyVal(result, 'item', undefined)
            })
        })
    })
})
