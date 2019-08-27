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

    describe('toJSON()', () => {
        context('when the StatusSuccess model is correct', () => {
            it('should return a JSON from StatusSuccess model', () => {
                let result = new StatusSuccess(statusSuccessJSON.code, statusSuccessJSON.item)
                result = result.toJSON()
                assert.propertyVal(result, 'code', statusSuccessJSON.code)
                assert.propertyVal(result.item, 'date', statusSuccessJSON.item.date)
                assert.propertyVal(result.item, 'value', statusSuccessJSON.item.value)
                assert.propertyVal(result.item, 'type', statusSuccessJSON.item.type)
                assert.propertyVal(result.item, 'child_id', statusSuccessJSON.item.child_id)
            })
        })
    })
})
