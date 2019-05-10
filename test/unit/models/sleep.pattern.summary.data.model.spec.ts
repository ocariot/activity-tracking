import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'

describe('Models: SleepPatternSummaryData', () => {
    const summaryDataJSON: any = {
        count: 2,
        duration: 100000
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an SleepPatternSummaryData model', () => {
                const result = new SleepPatternSummaryData(summaryDataJSON.count, summaryDataJSON.duration).fromJSON(summaryDataJSON)
                assert.typeOf(result.count, 'number')
                assert.propertyVal(result, 'count', summaryDataJSON.count)
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', summaryDataJSON.duration)
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPatternSummaryData model with all attributes with undefined value', () => {
                const result = new SleepPatternSummaryData(0, 0).fromJSON(undefined)
                assert.equal(result.count, 0)
                assert.equal(result.duration, 0)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPatternSummaryData model', () => {
                const result = new SleepPatternSummaryData(summaryDataJSON.count, summaryDataJSON.duration)
                                    .fromJSON(JSON.stringify(summaryDataJSON))
                assert.typeOf(result.count, 'number')
                assert.propertyVal(result, 'count', summaryDataJSON.count)
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', summaryDataJSON.duration)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the SleepPatternSummaryData model is correct', () => {
            it('should return a JSON from SleepPatternSummaryData model', () => {
                let result = new SleepPatternSummaryData(summaryDataJSON.count, summaryDataJSON.duration).fromJSON(summaryDataJSON)
                result = result.toJSON()
                assert.typeOf(result.count, 'number')
                assert.propertyVal(result, 'count', summaryDataJSON.count)
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', summaryDataJSON.duration)
            })
        })
    })
})
