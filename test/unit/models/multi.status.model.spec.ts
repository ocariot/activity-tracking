import { assert } from 'chai'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { MultiStatusMock } from '../../mocks/multi.status.mock'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { LogMock } from '../../mocks/log.mock'

describe('Models: MultiStatus', () => {
    const logs: Array<Log> = [new LogMock()]
    const incorrectLog = new Log('20199-03-08', 250, LogType.CALORIES, '5a62be07de34500146d9c544')
    logs.push(incorrectLog)

    const multiStatusMock: MultiStatus<Log> = new MultiStatusMock<Log>(logs)

    describe('toJSON()', () => {
        context('when the MultiStatus model is correct', () => {
            it('should return a JSON from MultiStatus model', () => {
                let result = new MultiStatus(multiStatusMock.success, multiStatusMock.error)
                result = result.toJSON()
                assert.deepPropertyVal(result.success[0], 'code', multiStatusMock.success[0].code)
                assert.deepPropertyVal(result.success[0], 'item', multiStatusMock.success[0].item)
                assert.deepPropertyVal(result.error[0], 'code', multiStatusMock.error[0].code)
                assert.deepPropertyVal(result.error[0], 'message', multiStatusMock.error[0].message)
                assert.deepPropertyVal(result.error[0], 'description', multiStatusMock.error[0].description)
                assert.deepPropertyVal(result.error[0], 'item', multiStatusMock.error[0].item)
            })
        })

        context('when the MultiStatus model is empty', () => {
            it('should return a JSON from MultiStatus model with undefined as the value of all attributes', () => {
                let result = new MultiStatus()
                result = result.toJSON()
                assert.propertyVal(result, 'success', undefined)
                assert.propertyVal(result, 'error', undefined)
            })
        })
    })
})
