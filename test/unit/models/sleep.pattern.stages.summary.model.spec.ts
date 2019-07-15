import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternStagesSummary } from '../../../src/application/domain/model/sleep.pattern.stages.summary'

describe('Models: SleepPatternStagesSummary', () => {
    const summaryDataJSON: any = {
        deep: new SleepPatternSummaryData(1, 1000),
        light: new SleepPatternSummaryData(2, 10000),
        rem: new SleepPatternSummaryData(3, 20000),
        wake: new SleepPatternSummaryData(4, 30000)
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an SleepPatternStagesSummary model', () => {
                const result = new SleepPatternStagesSummary(summaryDataJSON.count, summaryDataJSON.duration).fromJSON(summaryDataJSON)
                assert.deepPropertyVal(result, 'deep', summaryDataJSON.deep)
                assert.deepPropertyVal(result, 'light', summaryDataJSON.light)
                assert.deepPropertyVal(result, 'rem', summaryDataJSON.rem)
                assert.deepPropertyVal(result, 'wake', summaryDataJSON.wake)
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPatternStagesSummary model with all attributes with undefined value', () => {
                const result = new SleepPatternStagesSummary().fromJSON(undefined)
                assert.isUndefined(result.deep)
                assert.isUndefined(result.light)
                assert.isUndefined(result.rem)
                assert.isUndefined(result.wake)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPatternStagesSummary model', () => {
                const result = new SleepPatternStagesSummary().fromJSON(JSON.stringify(summaryDataJSON))
                assert.deepPropertyVal(result, 'deep', summaryDataJSON.deep)
                assert.deepPropertyVal(result, 'light', summaryDataJSON.light)
                assert.deepPropertyVal(result, 'rem', summaryDataJSON.rem)
                assert.deepPropertyVal(result, 'wake', summaryDataJSON.wake)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the SleepPatternStagesSummary model is correct', () => {
            it('should return a JSON from SleepPatternStagesSummary model', () => {
                let result = new SleepPatternStagesSummary().fromJSON(summaryDataJSON)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'deep', summaryDataJSON.deep)
                assert.deepPropertyVal(result, 'light', summaryDataJSON.light)
                assert.deepPropertyVal(result, 'rem', summaryDataJSON.rem)
                assert.deepPropertyVal(result, 'wake', summaryDataJSON.wake)
            })
        })
    })
})
