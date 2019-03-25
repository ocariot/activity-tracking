import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPattern, SleepPatternType } from '../../../src/application/domain/model/sleep.pattern'
import { SleepPatternSummary } from '../../../src/application/domain/model/sleep.pattern.summary'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'

describe('Models: SleepPattern', () => {
    const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem.start_time = new Date('2018-08-18T01:30:30Z')
    dataSetItem.name = SleepPatternType.RESTLESS
    dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds

    const dataSetItem2: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem2.start_time = new Date('2018-08-18T01:45:30Z')
    dataSetItem2.name = SleepPatternType.AWAKE
    dataSetItem2.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds

    const dataSetItem3: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem3.start_time = new Date('2018-08-18T02:45:30Z')
    dataSetItem3.name = SleepPatternType.ASLEEP
    dataSetItem3.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds

    const summaryDataJSON: any = {
        data_set: [dataSetItem, dataSetItem2, dataSetItem3],
        summary: new SleepPatternSummary(new SleepPatternSummaryData(2, 10000),
                                         new SleepPatternSummaryData(3, 20000),
                                         new SleepPatternSummaryData(4, 30000))
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an SleepPattern model', () => {
                const result = new SleepPattern().fromJSON(summaryDataJSON)
                // Pattern data_set
                assert(result.data_set, 'data_set must not be undefined')
                assert(result.data_set[0].start_time, 'data_set[0] start_time must not be undefined')
                assert(result.data_set[0].name, 'data_set[0] name must not be undefined')
                assert(result.data_set[0].duration, 'data_set[0] duration must not be undefined')
                assert.propertyVal(result.data_set[0], 'name', summaryDataJSON.data_set[0].name)
                assert.propertyVal(result.data_set[0], 'duration', summaryDataJSON.data_set[0].duration)
                assert(result.data_set[1].start_time, 'data_set[1] start_time must not be undefined')
                assert(result.data_set[1].name, 'data_set[1] name must not be undefined')
                assert(result.data_set[1].duration, 'data_set[1] duration must not be undefined')
                assert.propertyVal(result.data_set[1], 'name', summaryDataJSON.data_set[1].name)
                assert.propertyVal(result.data_set[1], 'duration', summaryDataJSON.data_set[1].duration)
                assert(result.data_set[2].start_time, 'data_set[2] start_time must not be undefined')
                assert(result.data_set[2].name, 'data_set[2] name must not be undefined')
                assert(result.data_set[2].duration, 'data_set[2] duration must not be undefined')
                assert.propertyVal(result.data_set[2], 'name', summaryDataJSON.data_set[2].name)
                assert.propertyVal(result.data_set[2], 'duration', summaryDataJSON.data_set[2].duration)
                // Pattern summary
                assert(result.summary, 'summary must not be undefined')
                // Pattern summary awake
                assert(result.summary.awake.count, 'awake count must not be undefined')
                assert.typeOf(result.summary.awake.count, 'number')
                assert.propertyVal(result.summary.awake, 'count', summaryDataJSON.summary.awake.count)
                assert(result.summary.awake.duration, 'awake duration must not be undefined')
                assert.typeOf(result.summary.awake.duration, 'number')
                assert.propertyVal(result.summary.awake, 'duration', summaryDataJSON.summary.awake.duration)
                // Pattern summary asleep
                assert(result.summary.asleep.count, 'asleep count must not be undefined')
                assert.typeOf(result.summary.asleep.count, 'number')
                assert.propertyVal(result.summary.asleep, 'count', summaryDataJSON.summary.asleep.count)
                assert(result.summary.asleep.duration, 'asleep duration must not be undefined')
                assert.typeOf(result.summary.asleep.duration, 'number')
                assert.propertyVal(result.summary.asleep, 'duration', summaryDataJSON.summary.asleep.duration)
                // Pattern summary restless
                assert(result.summary.restless.count, 'restless count must not be undefined')
                assert.typeOf(result.summary.restless.count, 'number')
                assert.propertyVal(result.summary.restless, 'count', summaryDataJSON.summary.restless.count)
                assert(result.summary.restless.duration, 'restless duration must not be undefined')
                assert.typeOf(result.summary.restless.duration, 'number')
                assert.propertyVal(result.summary.restless, 'duration', summaryDataJSON.summary.restless.duration)
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
                // Pattern data_set
                assert(result.data_set, 'data_set must not be undefined')
                assert(result.data_set[0].start_time, 'data_set[0] start_time must not be undefined')
                assert(result.data_set[0].name, 'data_set[0] name must not be undefined')
                assert(result.data_set[0].duration, 'data_set[0] duration must not be undefined')
                assert.propertyVal(result.data_set[0], 'name', summaryDataJSON.data_set[0].name)
                assert.propertyVal(result.data_set[0], 'duration', summaryDataJSON.data_set[0].duration)
                assert(result.data_set[1].start_time, 'data_set[1] start_time must not be undefined')
                assert(result.data_set[1].name, 'data_set[1] name must not be undefined')
                assert(result.data_set[1].duration, 'data_set[1] duration must not be undefined')
                assert.propertyVal(result.data_set[1], 'name', summaryDataJSON.data_set[1].name)
                assert.propertyVal(result.data_set[1], 'duration', summaryDataJSON.data_set[1].duration)
                assert(result.data_set[2].start_time, 'data_set[2] start_time must not be undefined')
                assert(result.data_set[2].name, 'data_set[2] name must not be undefined')
                assert(result.data_set[2].duration, 'data_set[2] duration must not be undefined')
                assert.propertyVal(result.data_set[2], 'name', summaryDataJSON.data_set[2].name)
                assert.propertyVal(result.data_set[2], 'duration', summaryDataJSON.data_set[2].duration)
                // Pattern summary
                assert(result.summary, 'summary must not be undefined')
                // Pattern summary awake
                assert(result.summary.awake.count, 'awake count must not be undefined')
                assert.typeOf(result.summary.awake.count, 'number')
                assert.propertyVal(result.summary.awake, 'count', summaryDataJSON.summary.awake.count)
                assert(result.summary.awake.duration, 'awake duration must not be undefined')
                assert.typeOf(result.summary.awake.duration, 'number')
                assert.propertyVal(result.summary.awake, 'duration', summaryDataJSON.summary.awake.duration)
                // Pattern summary asleep
                assert(result.summary.asleep.count, 'asleep count must not be undefined')
                assert.typeOf(result.summary.asleep.count, 'number')
                assert.propertyVal(result.summary.asleep, 'count', summaryDataJSON.summary.asleep.count)
                assert(result.summary.asleep.duration, 'asleep duration must not be undefined')
                assert.typeOf(result.summary.asleep.duration, 'number')
                assert.propertyVal(result.summary.asleep, 'duration', summaryDataJSON.summary.asleep.duration)
                // Pattern summary restless
                assert(result.summary.restless.count, 'restless count must not be undefined')
                assert.typeOf(result.summary.restless.count, 'number')
                assert.propertyVal(result.summary.restless, 'count', summaryDataJSON.summary.restless.count)
                assert(result.summary.restless.duration, 'restless duration must not be undefined')
                assert.typeOf(result.summary.restless.duration, 'number')
                assert.propertyVal(result.summary.restless, 'duration', summaryDataJSON.summary.restless.duration)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the SleepPattern model is correct', () => {
            it('should return a JSON from SleepPattern model', () => {
                let result = new SleepPattern().fromJSON(summaryDataJSON)
                result = result.toJSON()
                // Pattern data_set
                assert(result.data_set, 'data_set must not be undefined')
                assert(result.data_set[0].start_time, 'data_set[0] start_time must not be undefined')
                assert(result.data_set[0].name, 'data_set[0] name must not be undefined')
                assert(result.data_set[0].duration, 'data_set[0] duration must not be undefined')
                assert.propertyVal(result.data_set[0], 'name', summaryDataJSON.data_set[0].name)
                assert.propertyVal(result.data_set[0], 'duration', summaryDataJSON.data_set[0].duration)
                assert(result.data_set[1].start_time, 'data_set[1] start_time must not be undefined')
                assert(result.data_set[1].name, 'data_set[1] name must not be undefined')
                assert(result.data_set[1].duration, 'data_set[1] duration must not be undefined')
                assert.propertyVal(result.data_set[1], 'name', summaryDataJSON.data_set[1].name)
                assert.propertyVal(result.data_set[1], 'duration', summaryDataJSON.data_set[1].duration)
                assert(result.data_set[2].start_time, 'data_set[2] start_time must not be undefined')
                assert(result.data_set[2].name, 'data_set[2] name must not be undefined')
                assert(result.data_set[2].duration, 'data_set[2] duration must not be undefined')
                assert.propertyVal(result.data_set[2], 'name', summaryDataJSON.data_set[2].name)
                assert.propertyVal(result.data_set[2], 'duration', summaryDataJSON.data_set[2].duration)
                // Pattern summary
                assert(result.summary, 'summary must not be undefined')
                // Pattern summary awake
                assert(result.summary.awake.count, 'awake count must not be undefined')
                assert.typeOf(result.summary.awake.count, 'number')
                assert.propertyVal(result.summary.awake, 'count', summaryDataJSON.summary.awake.count)
                assert(result.summary.awake.duration, 'awake duration must not be undefined')
                assert.typeOf(result.summary.awake.duration, 'number')
                assert.propertyVal(result.summary.awake, 'duration', summaryDataJSON.summary.awake.duration)
                // Pattern summary asleep
                assert(result.summary.asleep.count, 'asleep count must not be undefined')
                assert.typeOf(result.summary.asleep.count, 'number')
                assert.propertyVal(result.summary.asleep, 'count', summaryDataJSON.summary.asleep.count)
                assert(result.summary.asleep.duration, 'asleep duration must not be undefined')
                assert.typeOf(result.summary.asleep.duration, 'number')
                assert.propertyVal(result.summary.asleep, 'duration', summaryDataJSON.summary.asleep.duration)
                // Pattern summary restless
                assert(result.summary.restless.count, 'restless count must not be undefined')
                assert.typeOf(result.summary.restless.count, 'number')
                assert.propertyVal(result.summary.restless, 'count', summaryDataJSON.summary.restless.count)
                assert(result.summary.restless.duration, 'restless duration must not be undefined')
                assert.typeOf(result.summary.restless.duration, 'number')
                assert.propertyVal(result.summary.restless, 'duration', summaryDataJSON.summary.restless.duration)
            })
        })
    })
})
