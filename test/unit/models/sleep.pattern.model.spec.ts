import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'
import { StagesPatternType } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { SleepPatternStagesSummary } from '../../../src/application/domain/model/sleep.pattern.stages.summary'

describe('Models: SleepPattern', () => {

    const summaryDataJSON: any = {
        data_set: [
            {
                start_time: '2018-08-18T01:30:30Z',
                name: StagesPatternType.DEEP,
                duration: Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
            },
            {
                start_time: '2018-08-18T01:45:30Z',
                name: StagesPatternType.LIGHT,
                duration: Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
            },
            {
                start_time: '2018-08-18T02:45:30Z',
                name: StagesPatternType.REM,
                duration: Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
            },
            {
                start_time: '2018-08-18T03:45:30Z',
                name: StagesPatternType.AWAKE,
                duration: Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
            }
        ],
        summary: new SleepPatternStagesSummary(new SleepPatternSummaryData(2, 10000),
            new SleepPatternSummaryData(3, 20000),
            new SleepPatternSummaryData(4, 30000),
            new SleepPatternSummaryData(5, 40000))
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an SleepPattern model', () => {
                const result = new SleepPattern().fromJSON(summaryDataJSON)

                let i = 0
                for (const dataSetItem of result.data_set) {
                    assert.deepPropertyVal(dataSetItem, 'start_time', new Date(summaryDataJSON.data_set[i].start_time))
                    assert.deepPropertyVal(dataSetItem, 'name', summaryDataJSON.data_set[i].name)
                    assert.deepPropertyVal(dataSetItem, 'duration', summaryDataJSON.data_set[i].duration)
                    i++
                }
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

                let i = 0
                for (const dataSetItem of result.data_set) {
                    assert.deepPropertyVal(dataSetItem, 'start_time', new Date(summaryDataJSON.data_set[i].start_time))
                    assert.deepPropertyVal(dataSetItem, 'name', summaryDataJSON.data_set[i].name)
                    assert.deepPropertyVal(dataSetItem, 'duration', summaryDataJSON.data_set[i].duration)
                    i++
                }
            })
        })
    })

    describe('toJSON()', () => {
        context('when the SleepPattern model is correct', () => {
            it('should return a JSON from SleepPattern model', () => {
                let result = new SleepPattern().fromJSON(summaryDataJSON)
                result = result.toJSON()
                // Pattern data_set
                assert.propertyVal(result.data_set[0], 'start_time', summaryDataJSON.data_set[0].start_time.substr(0, 19))
                assert.propertyVal(result.data_set[0], 'name', summaryDataJSON.data_set[0].name)
                assert.propertyVal(result.data_set[0], 'duration', summaryDataJSON.data_set[0].duration)
                assert.propertyVal(result.data_set[1], 'start_time', summaryDataJSON.data_set[1].start_time.substr(0, 19))
                assert.propertyVal(result.data_set[1], 'name', summaryDataJSON.data_set[1].name)
                assert.propertyVal(result.data_set[1], 'duration', summaryDataJSON.data_set[1].duration)
                assert.propertyVal(result.data_set[2], 'start_time', summaryDataJSON.data_set[2].start_time.substr(0, 19))
                assert.propertyVal(result.data_set[2], 'name', summaryDataJSON.data_set[2].name)
                assert.propertyVal(result.data_set[2], 'duration', summaryDataJSON.data_set[2].duration)
            })
        })
    })
})
