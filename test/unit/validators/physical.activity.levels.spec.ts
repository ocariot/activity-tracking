import { assert } from 'chai'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { PhysicalActivityLevelsValidator } from '../../../src/application/domain/validator/physical.activity.levels.validator'

let levels: Array<PhysicalActivityLevel> =
        [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
         new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]

describe('Validators: PhysicalActivityLevelsValidator', () => {
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
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Level are not in a format that is supported!')
                assert.equal(err.description, 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
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
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'The name of level provided "lightlys" is not supported...')
                assert.equal(err.description, 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
            }
            levels[1] = new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000))
        })
    })

    context('when the physical activity levels array has an invalid level (missing one of the fields, the name)', () => {
        it('should throw a ValidationException', () => {
            const levelsJSON = {
                name: '',
                duration: Math.floor((Math.random() * 10) * 60000)
            }

            let levelTest: PhysicalActivityLevel = new PhysicalActivityLevel()
            levelTest = levelTest.fromJSON(levelsJSON)
            levels[1] = levelTest

            try {
                PhysicalActivityLevelsValidator.validate(levels)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Level are not in a format that is supported!')
                assert.equal(err.description, 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
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
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Level are not in a format that is supported...')
                assert.equal(err.description, 'Validation of physical activity levels failed:  level duration is required!')
            }
            levels[1].duration = Math.floor((Math.random() * 10) * 60000)
        })
    })

    context('when the physical activity levels array has an invalid measurement (missing all fields)', () => {
        it('should throw a ValidationException', () => {
            const levelsJSON = {
                name: '',
                duration: undefined
            }

            let levelTest: PhysicalActivityLevel = new PhysicalActivityLevel()
            levelTest = levelTest.fromJSON(levelsJSON)
            levels[1] = levelTest

            try {
                PhysicalActivityLevelsValidator.validate(levels)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Level are not in a format that is supported!')
                assert.equal(err.description, 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
            }
            levels[1] = new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000))
        })
    })

    context('when the physical activity levels array has an invalid level (the duration is negative)', () => {
        it('should throw a ValidationException', () => {
            levels[1].duration = -(Math.floor((Math.random() * 10) * 60000))
            try {
                PhysicalActivityLevelsValidator.validate(levels)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Some (or several) duration field of levels array is invalid...')
                assert.equal(err.description, 'Physical Activity Level validation failed: The value provided has a negative value!')
            }
            levels[1].duration = Math.floor((Math.random() * 10) * 60000)
        })
    })
})
