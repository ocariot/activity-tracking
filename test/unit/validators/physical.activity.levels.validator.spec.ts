import { assert } from 'chai'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { PhysicalActivityLevelsValidator } from '../../../src/application/domain/validator/physical.activity.levels.validator'
import { Strings } from '../../../src/utils/strings'

let levels: Array<PhysicalActivityLevel> =
        [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]

describe('Validators: PhysicalActivityLevelsValidator', () => {
    describe('validate(levels: Array<PhysicalActivityLevel>)', () => {
        context('when the physical activity levels in array has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = PhysicalActivityLevelsValidator.validate(levels)
                assert.equal(result, undefined)
            })
        })

        context('when the physical activity levels array is empty', () => {
            it('should throw a ValidationException', () => {
                levels = new Array<PhysicalActivityLevel>()
                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The levels array must have values for the following levels: ' +
                        'sedentary, lightly, fairly, very.')
                }
                levels = [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
                    new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
                    new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
                    new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]
            })
        })

        context('when the physical activity levels array has an invalid level (invalid name)', () => {
            it('should throw a ValidationException', () => {
                const levelsJSON = {
                    name: 'lightlys',
                    duration: Math.floor((Math.random() * 10) * 60000)
                }

                let levelTest: PhysicalActivityLevel = new PhysicalActivityLevel()
                levelTest = levelTest.fromJSON(levelsJSON)
                levels[1] = levelTest

                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                }
                levels[1] = new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000))
            })
        })

        context('when the physical activity levels array has an invalid level (missing one of the fields, the name)', () => {
            it('should throw a ValidationException', () => {
                const levelsJSON = {
                    name: undefined,
                    duration: Math.floor((Math.random() * 10) * 60000)
                }

                let levelTest: PhysicalActivityLevel = new PhysicalActivityLevel()
                levelTest = levelTest.fromJSON(levelsJSON)
                levels[1] = levelTest

                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The levels array must have values for the following levels: ' +
                        'sedentary, lightly, fairly, very.')
                }
                levels[1] = new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000))
            })
        })

        context('when the physical activity levels array has an invalid level (missing one of the fields, the duration)', () => {
            it('should throw a ValidationException', () => {
                levels[1].duration = undefined!
                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'levels.duration'))
                }
                levels[1].duration = Math.floor((Math.random() * 10) * 60000)
            })
        })

        context('when the physical activity levels array has an invalid level (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                const levelsJSON = {
                    name: undefined,
                    duration: undefined
                }

                let levelTest: PhysicalActivityLevel = new PhysicalActivityLevel()
                levelTest = levelTest.fromJSON(levelsJSON)
                levels[1] = levelTest

                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The levels array must have values for the following levels: ' +
                        'sedentary, lightly, fairly, very.')
                }
                levels[1] = new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000))
            })
        })

        context('when the physical activity levels array has an invalid level (the duration is negative)', () => {
            it('should throw a ValidationException', () => {
                levels[1].duration = -(Math.floor((Math.random() * 10 + 1) * 60000))
                try {
                    PhysicalActivityLevelsValidator.validate(levels)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                        .replace('{0}', 'levels.duration'))
                }
                levels[1].duration = Math.floor((Math.random() * 10 + 1) * 60000)
            })
        })
    })
})
