import { assert } from 'chai'
import { ChildLog } from '../../../src/application/domain/model/child.log'
import { ChildLogMock } from '../../mocks/child.log.mock'

describe('Models: ChildLog', () => {
    const childLog: ChildLog = new ChildLogMock()

    describe('toJSON()', () => {
        context('when the ChildLog model is correct', () => {
            it('should return a JSON from ChildLog model', () => {
                let result = new ChildLog(childLog.steps, childLog.calories, childLog.active_minutes,
                    childLog.lightly_active_minutes, childLog.sedentary_minutes)
                result = result.toJSON()
                assert.deepEqual(result.steps[0], childLog.steps[0].toJSON())
                assert.deepEqual(result.steps[1], childLog.steps[1].toJSON())
                assert.deepEqual(result.steps[2], childLog.steps[2].toJSON())
                assert.deepEqual(result.calories[0], childLog.calories[0].toJSON())
                assert.deepEqual(result.calories[1], childLog.calories[1].toJSON())
                assert.deepEqual(result.calories[2], childLog.calories[2].toJSON())
                assert.deepEqual(result.active_minutes[0], childLog.active_minutes[0].toJSON())
                assert.deepEqual(result.active_minutes[1], childLog.active_minutes[1].toJSON())
                assert.deepEqual(result.active_minutes[2], childLog.active_minutes[2].toJSON())
                assert.deepEqual(result.lightly_active_minutes[0], childLog.lightly_active_minutes[0].toJSON())
                assert.deepEqual(result.lightly_active_minutes[1], childLog.lightly_active_minutes[1].toJSON())
                assert.deepEqual(result.lightly_active_minutes[2], childLog.lightly_active_minutes[2].toJSON())
                assert.deepEqual(result.sedentary_minutes[0], childLog.sedentary_minutes[0].toJSON())
                assert.deepEqual(result.sedentary_minutes[1], childLog.sedentary_minutes[1].toJSON())
                assert.deepEqual(result.sedentary_minutes[2], childLog.sedentary_minutes[2].toJSON())
            })
        })

        context('when the ChildLog model is empty', () => {
            it('should return a JSON from ChildLog model with undefined as the value of all attributes', () => {
                let result = new ChildLog()
                result = result.toJSON()
                assert.propertyVal(result, 'steps', undefined)
                assert.propertyVal(result, 'calories', undefined)
                assert.propertyVal(result, 'active_minutes', undefined)
                assert.propertyVal(result, 'lightly_active_minutes', undefined)
                assert.propertyVal(result, 'sedentary_minutes', undefined)
            })
        })
    })
})
