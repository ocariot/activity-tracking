import { assert } from 'chai'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'

describe('Models: SleepPatternDataSet', () => {
    const dataSetJSON: any = {
        start_time: new Date().toISOString(),
        name: 'restless',
        duration: 100000
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an SleepPatternDataSet model', () => {
                const result = new SleepPatternDataSet().fromJSON(dataSetJSON)
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', dataSetJSON.name)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', dataSetJSON.duration)
            })
        })

        context('when the json is undefined', () => {
            it('should return an SleepPatternDataSet model with all attributes with undefined value', () => {
                const result = new SleepPatternDataSet().fromJSON(undefined)
                assert.isUndefined(result.start_time)
                assert.isUndefined(result.name)
                assert.isUndefined(result.duration)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return SleepPatternDataSet model', () => {
                const result = new SleepPatternDataSet().fromJSON(JSON.stringify(dataSetJSON))
                assert(result.start_time, 'start_time must not be undefined')
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', dataSetJSON.name)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', dataSetJSON.duration)
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from SleepPatternDataSet model', () => {
            let result = new SleepPatternDataSet().fromJSON(dataSetJSON)
            result = result.toJSON()
            assert(result.start_time, 'start_time must not be undefined')
            assert(result.name, 'name must not be undefined')
            assert.typeOf(result.name, 'string')
            assert.propertyVal(result, 'name', dataSetJSON.name)
            assert(result.duration, 'duration must not be undefined')
            assert.typeOf(result.duration, 'number')
            assert.propertyVal(result, 'duration', dataSetJSON.duration)
        })
    })
})
