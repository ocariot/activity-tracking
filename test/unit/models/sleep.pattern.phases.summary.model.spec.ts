import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternPhasesSummary } from '../../../src/application/domain/model/sleep.pattern.phases.summary'

describe('Models: SleepPatternPhasesSummary', () => {
    const summaryDataJSON: any = {
        awake: new SleepPatternSummaryData(1, 1000),
        asleep: new SleepPatternSummaryData(2, 10000),
        restless: new SleepPatternSummaryData(3, 20000)
    }

    describe('toJSON()', () => {
        context('when the SleepPatternPhasesSummary model is correct', () => {
            it('should return a JSON from SleepPatternPhasesSummary model', () => {
                let result = new SleepPatternPhasesSummary(summaryDataJSON.awake, summaryDataJSON.asleep, summaryDataJSON.restless)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
                assert.deepPropertyVal(result, 'asleep', summaryDataJSON.asleep)
                assert.deepPropertyVal(result, 'restless', summaryDataJSON.restless)
            })
        })
    })
})
