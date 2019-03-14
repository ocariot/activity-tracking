import { assert } from 'chai'
import { PhysicalActivityLog } from '../../../src/application/domain/model/physical.activity.log'
import { Log } from '../../../src/application/domain/model/log'

describe('Models: PhysicalActivityLog', () => {
    const activityLogJSON: any = {
        steps: new Array<Log>(),
        calories: new Array<Log>()
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an PhysicalActivityLog model', () => {
                const result = new PhysicalActivityLog().fromJSON(activityLogJSON)
                assert(result.steps, 'steps must not be undefined')
                assert(result.calories, 'calories must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an PhysicalActivityLog model with all attributes with undefined value', () => {
                const result = new PhysicalActivityLog().fromJSON(undefined)
                assert.isUndefined(result.steps)
                assert.isUndefined(result.calories)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return PhysicalActivityLog model', () => {
                const result = new PhysicalActivityLog().fromJSON(JSON.stringify(activityLogJSON))
                assert(result.steps, 'steps must not be undefined')
                assert(result.calories, 'calories must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        context('when the PhysicalActivityLog model is correct', () => {
            it('should return a JSON from PhysicalActivityLog model', () => {
                let result = new PhysicalActivityLog().fromJSON(activityLogJSON)
                result = result.toJSON()
                assert(result.steps, 'steps must not be undefined')
                assert(result.calories, 'calories must not be undefined')
            })
        })
    })
})
