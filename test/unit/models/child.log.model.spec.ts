import { assert } from 'chai'
import { ChildLog } from '../../../src/application/domain/model/child.log'
import { LogMock } from '../../mocks/log.mock'
import { LogType } from '../../../src/application/domain/model/log'
import { ObjectID } from 'bson'

describe('Models: ChildLog', () => {
    const activityLogJSON: any = {
        id: new ObjectID(),
        steps: [(new LogMock(LogType.STEPS)).toJSON()],
        calories: [(new LogMock(LogType.CALORIES)).toJSON()],
        active_minutes: [(new LogMock(LogType.ACTIVE_MINUTES)).toJSON()],
        lightly_active_minutes: [(new LogMock(LogType.LIGHTLY_ACTIVE_MINUTES)).toJSON()],
        sedentary_minutes: [(new LogMock(LogType.SEDENTARY_MINUTES)).toJSON()]
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an ChildLog model', () => {
                const result = new ChildLog().fromJSON(activityLogJSON)
                assert.deepPropertyVal(result.steps[0], 'date', activityLogJSON.steps[0].date)
                assert.deepPropertyVal(result.steps[0], 'value', activityLogJSON.steps[0].value)
                assert.deepPropertyVal(result.calories[0], 'date', activityLogJSON.calories[0].date)
                assert.deepPropertyVal(result.calories[0], 'value', activityLogJSON.calories[0].value)
                assert.deepPropertyVal(result.active_minutes[0], 'date', activityLogJSON.active_minutes[0].date)
                assert.deepPropertyVal(result.active_minutes[0], 'value', activityLogJSON.active_minutes[0].value)
                assert.deepPropertyVal(result.lightly_active_minutes[0], 'date', activityLogJSON.lightly_active_minutes[0].date)
                assert.deepPropertyVal(result.lightly_active_minutes[0], 'value', activityLogJSON.lightly_active_minutes[0].value)
                assert.deepPropertyVal(result.sedentary_minutes[0], 'date', activityLogJSON.sedentary_minutes[0].date)
                assert.deepPropertyVal(result.sedentary_minutes[0], 'value', activityLogJSON.sedentary_minutes[0].value)
            })
        })

        context('when the json is undefined', () => {
            it('should return an ChildLog model with all attributes with undefined value', () => {
                const result = new ChildLog().fromJSON(undefined)
                assert.isUndefined(result.steps)
                assert.isUndefined(result.calories)
                assert.isUndefined(result.active_minutes)
                assert.isUndefined(result.lightly_active_minutes)
                assert.isUndefined(result.sedentary_minutes)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return ChildLog model', () => {
                const result = new ChildLog().fromJSON(JSON.stringify(activityLogJSON))
                assert.deepPropertyVal(result.steps[0], 'date', activityLogJSON.steps[0].date)
                assert.deepPropertyVal(result.steps[0], 'value', activityLogJSON.steps[0].value)
                assert.deepPropertyVal(result.calories[0], 'date', activityLogJSON.calories[0].date)
                assert.deepPropertyVal(result.calories[0], 'value', activityLogJSON.calories[0].value)
                assert.deepPropertyVal(result.active_minutes[0], 'date', activityLogJSON.active_minutes[0].date)
                assert.deepPropertyVal(result.active_minutes[0], 'value', activityLogJSON.active_minutes[0].value)
                assert.deepPropertyVal(result.lightly_active_minutes[0], 'date', activityLogJSON.lightly_active_minutes[0].date)
                assert.deepPropertyVal(result.lightly_active_minutes[0], 'value', activityLogJSON.lightly_active_minutes[0].value)
                assert.deepPropertyVal(result.sedentary_minutes[0], 'date', activityLogJSON.sedentary_minutes[0].date)
                assert.deepPropertyVal(result.sedentary_minutes[0], 'value', activityLogJSON.sedentary_minutes[0].value)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the ChildLog model is correct', () => {
            it('should return a JSON from ChildLog model', () => {
                let result = new ChildLog().fromJSON(activityLogJSON)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'steps', activityLogJSON.steps)
                assert.deepPropertyVal(result, 'calories', activityLogJSON.calories)
                assert.deepPropertyVal(result, 'active_minutes', activityLogJSON.active_minutes)
                assert.deepPropertyVal(result, 'lightly_active_minutes', activityLogJSON.lightly_active_minutes)
                assert.deepPropertyVal(result, 'sedentary_minutes', activityLogJSON.sedentary_minutes)
            })
        })
    })
})
