import { ObjectID } from 'bson'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'
import { PhasesPatternType } from '../../../src/application/domain/model/sleep.pattern.data.set'

describe('Models: Sleep', () => {
    const sleepJSON: any = {
        id: new ObjectID(),
        start_time: '2020-08-18T01:30:30Z',
        end_time: '2020-08-18T21:30:30Z',
        duration: 900000,
        child_id: new ObjectID(),
        pattern: {
            data_set: [
                {
                    start_time: '2018-08-18T01:30:30Z',
                    name: PhasesPatternType.RESTLESS,
                    duration: Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
                },
                {
                    start_time: '2018-08-18T01:45:30Z',
                    name: PhasesPatternType.AWAKE,
                    duration: Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
                },
                {
                    start_time: '2018-08-18T02:45:30Z',
                    name: PhasesPatternType.ASLEEP,
                    duration: Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
                }
            ]
        }
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Sleep().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Sleep().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Sleep model', () => {
                const result = new Sleep().fromJSON(sleepJSON)
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert.deepPropertyVal(result, 'start_time', new Date(sleepJSON.start_time))
                assert.deepPropertyVal(result, 'end_time', new Date(sleepJSON.end_time))
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                let i = 0
                for (const dataSetItem of result.pattern!.data_set) {
                    assert.deepPropertyVal(dataSetItem, 'start_time', new Date(sleepJSON.pattern.data_set[i].start_time))
                    assert.deepPropertyVal(dataSetItem, 'name', sleepJSON.pattern.data_set[i].name)
                    assert.deepPropertyVal(dataSetItem, 'duration', sleepJSON.pattern.data_set[i].duration)
                    i++
                }
            })
        })

        context('when the json is undefined', () => {
            it('should return an Sleep model with all attributes with undefined value', () => {
                const result = new Sleep().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.start_time)
                assert.isUndefined(result.end_time)
                assert.isUndefined(result.duration)
                assert.isUndefined(result.child_id)
                assert.isUndefined(result.pattern)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Sleep model', () => {
                const result = new Sleep().fromJSON(JSON.stringify(sleepJSON))
                assert.propertyVal(result, 'id', sleepJSON.id.toHexString())
                assert.deepPropertyVal(result, 'start_time', new Date(sleepJSON.start_time))
                assert.deepPropertyVal(result, 'end_time', new Date(sleepJSON.end_time))
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert.propertyVal(result, 'child_id', sleepJSON.child_id.toHexString())
                let i = 0
                for (const dataSetItem of result.pattern!.data_set) {
                    assert.deepPropertyVal(dataSetItem, 'start_time', new Date(sleepJSON.pattern.data_set[i].start_time))
                    assert.deepPropertyVal(dataSetItem, 'name', sleepJSON.pattern.data_set[i].name)
                    assert.deepPropertyVal(dataSetItem, 'duration', sleepJSON.pattern.data_set[i].duration)
                    i++
                }
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Sleep model is correct', () => {
            it('should return a JSON from Sleep model', () => {
                let result = new Sleep().fromJSON(sleepJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert.propertyVal(result, 'start_time', sleepJSON.start_time.substr(0, 19))
                assert.propertyVal(result, 'end_time', sleepJSON.end_time.substr(0, 19))
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                assert.deepPropertyVal(result, 'pattern', (new SleepPattern().fromJSON(sleepJSON.pattern)).toJSON())
            })
        })
    })
})
