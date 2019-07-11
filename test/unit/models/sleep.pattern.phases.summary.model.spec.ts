import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternPhasesSummary } from '../../../src/application/domain/model/sleep.pattern.phases.summary'

describe('Models: SleepPatternPhasesSummary', () => {
    const summaryDataJSON: any = {
        awake: new SleepPatternSummaryData(1, 1000),
        asleep: new SleepPatternSummaryData(2, 10000),
        restless: new SleepPatternSummaryData(3, 20000)
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an SleepPatternPhasesSummary model', () => {
                const result = new SleepPatternPhasesSummary(summaryDataJSON.count, summaryDataJSON.duration).fromJSON(summaryDataJSON)
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
                assert.deepPropertyVal(result, 'asleep', summaryDataJSON.asleep)
                assert.deepPropertyVal(result, 'restless', summaryDataJSON.restless)
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPatternPhasesSummary model with all attributes with undefined value', () => {
                const result = new SleepPatternPhasesSummary().fromJSON(undefined)
                assert.isUndefined(result.awake)
                assert.isUndefined(result.asleep)
                assert.isUndefined(result.restless)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPatternPhasesSummary model', () => {
                const result = new SleepPatternPhasesSummary().fromJSON(JSON.stringify(summaryDataJSON))
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
                assert.deepPropertyVal(result, 'asleep', summaryDataJSON.asleep)
                assert.deepPropertyVal(result, 'restless', summaryDataJSON.restless)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the SleepPatternPhasesSummary model is correct', () => {
            it('should return a JSON from SleepPatternPhasesSummary model', () => {
                let result = new SleepPatternPhasesSummary().fromJSON(summaryDataJSON)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
                assert.deepPropertyVal(result, 'asleep', summaryDataJSON.asleep)
                assert.deepPropertyVal(result, 'restless', summaryDataJSON.restless)
            })
        })
    })
})
