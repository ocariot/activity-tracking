import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternStagesSummary } from '../../../src/application/domain/model/sleep.pattern.stages.summary'

describe('Models: SleepPatternStagesSummary', () => {
    const summaryDataJSON: any = {
        deep: new SleepPatternSummaryData(1, 1000),
        light: new SleepPatternSummaryData(2, 10000),
        rem: new SleepPatternSummaryData(3, 20000),
        awake: new SleepPatternSummaryData(4, 30000)
    }

    describe('toJSON()', () => {
        context('when the SleepPatternStagesSummary model is correct', () => {
            it('should return a JSON from SleepPatternStagesSummary model', () => {
                let result =
                    new SleepPatternStagesSummary(summaryDataJSON.deep, summaryDataJSON.light, summaryDataJSON.rem, summaryDataJSON.awake)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'deep', summaryDataJSON.deep)
                assert.deepPropertyVal(result, 'light', summaryDataJSON.light)
                assert.deepPropertyVal(result, 'rem', summaryDataJSON.rem)
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
            })
        })
    })
})
