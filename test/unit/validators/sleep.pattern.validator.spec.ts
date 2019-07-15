import { assert } from 'chai'
import { PhasesPatternType, SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'
import { SleepPatternValidator } from '../../../src/application/domain/validator/sleep.pattern.validator'
import { SleepType } from '../../../src/application/domain/model/sleep'

let sleepPattern: SleepPattern = new SleepPattern()
let dataSet: Array<SleepPatternDataSet> = []

const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
dataSetItem.start_time = new Date('2018-08-18T01:30:30Z')
dataSetItem.name = PhasesPatternType.RESTLESS
dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds

const dataSetItem2: SleepPatternDataSet = new SleepPatternDataSet()
dataSetItem2.start_time = new Date('2018-08-18T01:45:30Z')
dataSetItem2.name = PhasesPatternType.AWAKE
dataSetItem2.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds

const dataSetItem3: SleepPatternDataSet = new SleepPatternDataSet()
dataSetItem3.start_time = new Date('2018-08-18T02:45:30Z')
dataSetItem3.name = PhasesPatternType.ASLEEP
dataSetItem3.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds

dataSet.push(dataSetItem)
dataSet.push(dataSetItem2)
dataSet.push(dataSetItem3)

sleepPattern.data_set = dataSet

describe('Validators: SleepPatternValidator', () => {
    describe('validate(sleepPattern: SleepPattern)', () => {
        context('when the sleep pattern has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                assert.equal(result, undefined)
            })
        })

        context('when the sleep pattern does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                sleepPattern = new SleepPattern()
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'Pattern are not in a format that is supported...')
                    assert.equal(err.description, 'Validation of the standard of sleep failed: data_set is required!')
                }
                sleepPattern.data_set = dataSet
            })
        })

        context('when the sleep pattern data set array is empty', () => {
            it('should throw a ValidationException', () => {
                dataSet = new Array<SleepPatternDataSet>()
                sleepPattern.data_set = dataSet
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'Dataset are not in a format that is supported!')
                    assert.equal(err.description, 'The data_set collection must not be empty!')
                }
                dataSet.push(dataSetItem)
                dataSet.push(dataSetItem2)
                dataSet.push(dataSetItem3)
                sleepPattern.data_set = dataSet
            })
        })

        context('when the sleep pattern data set array has an invalid item (invalid name)', () => {
            it('should throw a ValidationException', () => {
                const dataSetItemJSON: any = {
                    start_time : new Date('2018-08-18T01:30:30Z'),
                    name : 'restlesss',
                    duration : Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min
                }
                sleepPattern.data_set[0] = new SleepPatternDataSet().fromJSON(dataSetItemJSON)
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'The sleep pattern name provided "restlesss" is not supported...')
                    assert.equal(err.description, 'The names of the allowed patterns are: asleep, restless, awake.')
                }
                sleepPattern.data_set[0] = dataSetItem
            })
        })

        context('when the sleep pattern data set array has an invalid item (invalid name) and the sleep type is "stages"', () => {
            it('should throw a ValidationException', () => {
                const dataSetItemJSON: any = {
                    start_time : new Date('2018-08-18T01:30:30Z'),
                    name : 'deeps',
                    duration : Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min
                }
                sleepPattern.data_set[0] = new SleepPatternDataSet().fromJSON(dataSetItemJSON)
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.STAGES)
                } catch (err) {
                    assert.equal(err.message, 'The sleep pattern name provided "deeps" is not supported...')
                    assert.equal(err.description, 'The names of the allowed patterns are: deep, light, rem, wake.')
                }
                sleepPattern.data_set[0] = dataSetItem
            })
        })

        context('when the sleep pattern data set array has an invalid item (missing one of the fields, the start_time)', () => {
            it('should throw a ValidationException', () => {
                dataSetItem.start_time = undefined!
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'Dataset are not in a format that is supported!')
                    assert.equal(err.description, 'Validation of the sleep pattern dataset failed: data_set start_time is required!')
                }
                dataSetItem.start_time = new Date('2018-08-18T01:30:30Z')
            })
        })

        context('when the sleep pattern data set array has an invalid item (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                const dataSetItemJSON: any = {
                    start_time : undefined,
                    name : '',
                    duration : undefined
                }
                sleepPattern.data_set[0] = new SleepPatternDataSet().fromJSON(dataSetItemJSON)
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'Dataset are not in a format that is supported!')
                    assert.equal(err.description, 'Validation of the sleep pattern dataset failed: data_set start_time, ' +
                        'data_set name, data_set duration is required!')
                }
                sleepPattern.data_set[0] = dataSetItem
            })
        })

        context('when the sleep pattern data set array has an invalid item (the duration is negative)', () => {
            it('should throw a ValidationException', () => {
                dataSetItem.duration = -(Math.floor(Math.random() * 5 + 1) * 60000) // 1-5min milliseconds
                try {
                    SleepPatternValidator.validate(sleepPattern, SleepType.CLASSIC)
                } catch (err) {
                    assert.equal(err.message, 'Some (or several) duration field of sleep pattern is invalid...')
                    assert.equal(err.description, 'Sleep Pattern dataset validation failed: The value provided has a negative value!')
                }
                dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
            })
        })
    })
})
