import { assert } from 'chai'
import { ObjectID } from 'bson'
import HttpStatus from 'http-status-codes'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { StatusSuccess } from '../../../src/application/domain/model/status.success'

describe('Models: StatusSuccess', () => {
    const statusSuccessJSON: any = {
        code: (HttpStatus.BAD_REQUEST).toString(),
        item: new Log('20199-03-11', 1000, LogType.STEPS, new ObjectID().toHexString())
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an StatusSuccess model', () => {
                const result = new StatusSuccess().fromJSON(statusSuccessJSON)
                assert(result.code, 'code must not be undefined')
                assert.typeOf(result.code, 'string')
                assert.propertyVal(result, 'code', statusSuccessJSON.code)
                assert(result.item, 'item must not be undefined')
                assert.propertyVal(result.item, 'date', statusSuccessJSON.item.date)
                assert.propertyVal(result.item, 'value', statusSuccessJSON.item.value)
                assert.propertyVal(result.item, 'type', statusSuccessJSON.item.type)
                assert.propertyVal(result.item, 'child_id', statusSuccessJSON.item.child_id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an StatusSuccess model with all attributes with undefined value', () => {
                const result = new StatusSuccess().fromJSON(undefined)
                assert.isUndefined(result.code)
                assert.isUndefined(result.item)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return StatusSuccess model', () => {
                const result = new StatusSuccess().fromJSON(JSON.stringify(statusSuccessJSON))
                assert(result.code, 'code must not be undefined')
                assert.typeOf(result.code, 'string')
                assert.propertyVal(result, 'code', statusSuccessJSON.code)
                assert(result.item, 'item must not be undefined')
                assert.propertyVal(result.item, 'date', statusSuccessJSON.item.date)
                assert.propertyVal(result.item, 'value', statusSuccessJSON.item.value)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the StatusSuccess model is correct', () => {
            it('should return a JSON from StatusSuccess model', () => {
                let result = new StatusSuccess().fromJSON(statusSuccessJSON)
                result = result.toJSON()
                assert(result.code, 'code must not be undefined')
                assert.typeOf(result.code, 'string')
                assert.propertyVal(result, 'code', statusSuccessJSON.code)
                assert(result.item, 'item must not be undefined')
                assert.propertyVal(result.item, 'date', statusSuccessJSON.item.date)
                assert.propertyVal(result.item, 'value', statusSuccessJSON.item.value)
                assert.propertyVal(result.item, 'type', statusSuccessJSON.item.type)
                assert.propertyVal(result.item, 'child_id', statusSuccessJSON.item.child_id)
            })
        })
    })
})
