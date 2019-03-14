import { assert } from 'chai'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { StatusSuccess } from '../../../src/application/domain/model/status.success'
import { Log } from '../../../src/application/domain/model/log'
import { StatusError } from '../../../src/application/domain/model/status.error'

describe('Models: MultiStatus', () => {
    const multiStatusJSON: any = {
        success: new Array<StatusSuccess<Log>>(),
        error: new Array<StatusError<Log>>()
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an MultiStatus model', () => {
                const result = new MultiStatus().fromJSON(multiStatusJSON)
                assert(result.success, 'success must not be undefined')
                assert(result.error, 'error must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an MultiStatus model with all attributes with undefined value', () => {
                const result = new MultiStatus().fromJSON(undefined)
                assert.isUndefined(result.success)
                assert.isUndefined(result.error)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return MultiStatus model', () => {
                const result = new MultiStatus().fromJSON(JSON.stringify(multiStatusJSON))
                assert(result.success, 'success must not be undefined')
                assert(result.error, 'error must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        context('when the MultiStatus model is correct', () => {
            it('should return a JSON from MultiStatus model', () => {
                let result = new MultiStatus().fromJSON(multiStatusJSON)
                result = result.toJSON()
                assert(result.success, 'success must not be undefined')
                assert(result.error, 'error must not be undefined')
            })
        })
    })
})
