import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternSummary } from '../../../src/application/domain/model/sleep.pattern.summary'

describe('Models: SleepPatternSummary', () => {
    const summaryDataJSON: any = {
        awake: new SleepPatternSummaryData(1, 1000),
        asleep: new SleepPatternSummaryData(2, 10000),
        restless: new SleepPatternSummaryData(3, 20000)
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an SleepPatternSummary model', () => {
                const result = new SleepPatternSummary(summaryDataJSON.count, summaryDataJSON.duration).fromJSON(summaryDataJSON)
                assert(result.awake, 'awake must not be undefined')
                assert(result.asleep, 'asleep must not be undefined')
                assert(result.restless, 'restless must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPatternSummary model with all attributes with undefined value', () => {
                const result = new SleepPatternSummary().fromJSON(undefined)
                assert.isUndefined(result.awake)
                assert.isUndefined(result.asleep)
                assert.isUndefined(result.restless)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPatternSummary model', () => {
                const result = new SleepPatternSummary().fromJSON(JSON.stringify(summaryDataJSON))
                assert(result.awake, 'awake must not be undefined')
                assert(result.asleep, 'asleep must not be undefined')
                assert(result.restless, 'restless must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from SleepPatternSummary model', () => {
            let result = new SleepPatternSummary().fromJSON(summaryDataJSON)
            result = result.toJSON()
            assert(result.awake, 'awake must not be undefined')
            assert(result.asleep, 'asleep must not be undefined')
            assert(result.restless, 'restless must not be undefined')
        })
    })
})
