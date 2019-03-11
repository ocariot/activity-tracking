import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'

describe('Models: SleepPattern', () => {
    const summaryDataJSON: any = {
        data_set: new Array<SleepPatternDataSet>(),
        summary: new SleepPatternSummaryData(2, 10000)
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an SleepPattern model', () => {
                const result = new SleepPattern().fromJSON(summaryDataJSON)
                assert(result.data_set, 'data_set must not be undefined')
                assert(result.summary, 'summary must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPattern model with all attributes with undefined value', () => {
                const result = new SleepPattern().fromJSON(undefined)
                assert.isUndefined(result.data_set)
                assert.isUndefined(result.summary)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPattern model', () => {
                const result = new SleepPattern().fromJSON(JSON.stringify(summaryDataJSON))
                assert(result.data_set, 'data_set must not be undefined')
                assert(result.summary, 'summary must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from SleepPattern model', () => {
            let result = new SleepPattern().fromJSON(summaryDataJSON)
            result = result.toJSON()
            assert(result.data_set, 'data_set must not be undefined')
            assert(result.summary, 'summary must not be undefined')
        })
    })
})
