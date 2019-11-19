import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { CreatePhysicalActivityValidator } from '../../../src/application/domain/validator/create.physical.activity.validator'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { ObjectID } from 'bson'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { PhysicalActivityHeartRateMock } from '../../mocks/physical.activity.heart.rate.mock'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

const activity: PhysicalActivityMock = new PhysicalActivityMock()
const fat_burn_zone_aux = activity.heart_rate!.fat_burn_zone

const incompleteActivity: PhysicalActivityMock = new PhysicalActivityMock()
incompleteActivity.levels = undefined
incompleteActivity.heart_rate = undefined

describe('Validators: CreatePhysicalActivityValidator', () => {
    describe('validate(activity: PhysicalActivity)', () => {
        /**
         * Activity parameters
         */
        context('when the physical activity has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreatePhysicalActivityValidator.validate(activity)
                assert.equal(result, undefined)
            })
        })

        context('when the physical activity has all the required parameters with valid values, and does not have the optional parameters',
            () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreatePhysicalActivityValidator.validate(incompleteActivity)
                assert.equal(result, undefined)
            })
        })

        context('when the physical activity does not have all the required parameters (in this case missing start_time)', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = undefined
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'start_time'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('when the physical activity does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                activity.end_time = undefined
                activity.duration = undefined
                activity.child_id = ''
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'start_time, end_time, duration, child_id'
                        .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('When the physical activity has an invalid parameter (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = new Date('2018-12-15T12:52:59Z')
                activity.end_time = new Date('2018-12-14T13:12:37Z')
                activity.duration = 1178000
                activity.child_id = '5a62be07de34500146d9c544'
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The end_time parameter can not contain an older date than ' +
                        'that the start_time parameter!')
                }
            })
        })

        context('When the physical activity has a duration that is incompatible with the start_time and end_time parameters', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = new Date('2018-12-14T12:52:59Z')
                activity.duration = 11780000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'duration value does not match values passed in start_time ' +
                        'and end_time parameters!')
                }
            })
        })

        context('When the physical activity has a negative duration', () => {
            it('should throw a ValidationException', () => {
                activity.duration = -1178000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'duration'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.duration = 1178000
            })
        })

        context('When the activity has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Parameter {child_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.child_id = '5a62be07de34500146d9c544'
            })
        })

        /**
         * PhysicalActivity parameters
         */
        context('when the physical activity does not have all the required parameters (in this case missing name)', () => {
            it('should throw a ValidationException', () => {
                activity.name = undefined
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'name'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                activity.name = 'walk'
            })
        })

        context('when the physical activity does not have all the required parameters (in this case missing calories)', () => {
            it('should throw a ValidationException', () => {
                activity.calories = undefined
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'calories'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                activity.calories = 200
            })
        })

        context('when the physical activity has an invalid parameter (negative calories)', () => {
            it('should throw a ValidationException', () => {
                activity.calories = -200
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'calories'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.calories = 200
            })
        })

        context('when the physical activity has an invalid parameter (negative steps)', () => {
            it('should throw a ValidationException', () => {
                activity.steps = -1000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'steps'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.steps = 1000
            })
        })

        context('when the physical activity has an invalid parameter (negative distance)', () => {
            it('should throw a ValidationException', () => {
                activity.distance = -1000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'distance'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.distance = 1000
            })
        })

        context('when the physical activity has an invalid level (invalid type)', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const activityJSON: any = {
                    id: new ObjectID(),
                    start_time: new Date('2018-12-14T12:52:59Z'),
                    end_time: new Date('2018-12-14T13:12:37Z'),
                    duration: 1178000,
                    child_id: '5a62be07de34500146d9c544',
                    name: 'walk',
                    calories: 200,
                    steps: 1000,
                    levels: [
                        {
                            name: 'sedentaries',
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                let activityTest: PhysicalActivity = new PhysicalActivity()
                activityTest = activityTest.fromJSON(activityJSON)

                try {
                    CreatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity has an invalid level (missing one of the fields, in this case lightly)', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const activityJSON: any = {
                    id: new ObjectID(),
                    start_time: new Date('2018-12-14T12:52:59Z'),
                    end_time: new Date('2018-12-14T13:12:37Z'),
                    duration: 1178000,
                    child_id: '5a62be07de34500146d9c544',
                    name: 'walk',
                    calories: 200,
                    steps: 1000,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: undefined,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                let activityTest: PhysicalActivity = new PhysicalActivity()
                activityTest = activityTest.fromJSON(activityJSON)

                try {
                    CreatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'The levels array must have values for the following levels: ' +
                        'sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity has an invalid level (there is a negative duration)', () => {
            it('should throw a ValidationException', () => {
                if (activity.levels) activity.levels[1].duration = -60000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'levels.duration'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                if (activity.levels) activity.levels![1].duration = Math.floor((Math.random() * 10) * 60000)
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate (the object is empty)', () => {
            it('should throw a ValidationException', () => {
                if (activity.heart_rate) activity.heart_rate = new PhysicalActivityHeartRate()
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.average, heart_rate.out_of_range_zone, ' +
                        'heart_rate.fat_burn_zone, heart_rate.cardio_zone, heart_rate.peak_zone'
                            .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate (the average parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate = new PhysicalActivityHeartRateMock()
                activity.heart_rate.average = -120
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.average'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.heart_rate.average = 120
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Fat Burn Zone" parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.fat_burn_zone = new HeartRateZone()
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.min, heart_rate.fat_burn_zone.max, ' +
                        'heart_rate.fat_burn_zone.duration'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                activity.heart_rate!.fat_burn_zone = fat_burn_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Fat Burn Zone" parameter has a negative duration)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.fat_burn_zone!.duration = -600000
                try {
                    CreatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.duration'
                        .concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.heart_rate!.fat_burn_zone!.duration = 600000
            })
        })
    })
})
