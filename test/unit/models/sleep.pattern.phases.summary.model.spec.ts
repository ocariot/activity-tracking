import { assert } from 'chai'
import { SleepPatternPhasesSummary } from '../../../src/application/domain/model/sleep.pattern.phases.summary'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'

describe('Models: SleepPatternPhasesSummary', () => {
    const summaryDataJSON: any = {
        awake: {
            count: 1,
            duration: 1000
        },
        asleep: {
            count: 2,
            duration: 10000
        },
        restless: {
            count: 3,
            duration: 20000
        },
    }

    describe('toJSON()', () => {
        context('when the SleepPatternPhasesSummary model is correct', () => {
            it('should return a JSON from SleepPatternPhasesSummary model', () => {
                let result: SleepPatternPhasesSummary = new SleepPatternPhasesSummary()
                result.awake = new SleepPatternSummaryData(summaryDataJSON.awake.count, summaryDataJSON.awake.duration)
                result.asleep = new SleepPatternSummaryData(summaryDataJSON.asleep.count, summaryDataJSON.asleep.duration)
                result.restless = new SleepPatternSummaryData(summaryDataJSON.restless.count, summaryDataJSON.restless.duration)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'awake', summaryDataJSON.awake)
                assert.deepPropertyVal(result, 'asleep', summaryDataJSON.asleep)
                assert.deepPropertyVal(result, 'restless', summaryDataJSON.restless)
            })
        })
    })
})
