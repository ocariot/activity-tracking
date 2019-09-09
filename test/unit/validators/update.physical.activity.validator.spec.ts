import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { ObjectID } from 'bson'
import { Strings } from '../../../src/utils/strings'
import { UpdatePhysicalActivityValidator } from '../../../src/application/domain/validator/update.physical.activity.validator'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { PhysicalActivityHeartRateMock } from '../../mocks/physical.activity.heart.rate.mock'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

const activity: PhysicalActivityMock = new PhysicalActivityMock()
const duration_aux = activity.duration
const out_of_range_zone_aux = activity.heart_rate!.out_of_range_zone
const fat_burn_zone_aux = activity.heart_rate!.fat_burn_zone
const cardio_zone_aux = activity.heart_rate!.cardio_zone
const peak_zone_aux = activity.heart_rate!.peak_zone

const incompleteActivity: PhysicalActivityMock = new PhysicalActivityMock()
incompleteActivity.id = undefined
incompleteActivity.child_id = ''
incompleteActivity.levels = undefined
incompleteActivity.heart_rate = undefined

describe('Validators: UpdatePhysicalActivityValidator', () => {
    describe('validate(physicalActivity: PhysicalActivity)', () => {
        /**
         * Activity parameters
         */
        context('when the physical activity has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = UpdatePhysicalActivityValidator.validate(activity)
                assert.equal(result, undefined)
            })
        })

        context('when the physical activity has not all the parameters', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = UpdatePhysicalActivityValidator.validate(incompleteActivity)
                assert.equal(result, undefined)
            })
        })

        context('When the physical activity has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Parameter {child_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.child_id = '5a62be07de34500146d9c544'
            })
        })

        context('When the physical activity has an invalid id', () => {
            it('should throw a ValidationException', () => {
                activity.id = '5a62be07de34500146d9c5442'
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Parameter {physicalactivity_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.id = '5a62be07de34500146d9c544'
            })
        })

        context('When the physical activity has a negative duration', () => {
            it('should throw a ValidationException', () => {
                activity.duration = -1178000
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
                }
                activity.duration = duration_aux
            })
        })
        /**
         * PhysicalActivity parameters
         */
        context('when the physical activity has an invalid parameter (negative calories)', () => {
            it('should throw a ValidationException', () => {
                activity.calories = -200
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Calories field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: The value provided has a negative value!')
                }
                activity.calories = 200
            })
        })

        context('when the physical activity has an invalid parameter (negative steps)', () => {
            it('should throw a ValidationException', () => {
                activity.steps = -1000
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Steps field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: The value provided has a negative value!')
                }
                activity.steps = 1000
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
                    UpdatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.equal(err.message, 'The name of level provided "sedentaries" is not supported...')
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
                            name: '',
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
                    UpdatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.equal(err.message, 'Level are not in a format that is supported!')
                    assert.equal(err.description, 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity has an invalid level (there is a negative duration)', () => {
            it('should throw a ValidationException', () => {
                if (activity.levels) activity.levels[1].duration = -100
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Some (or several) duration field of levels array is invalid...')
                    assert.equal(err.description, 'Physical Activity Level validation failed: The value provided has a negative value!')
                }
                if (activity.levels) activity.levels![1].duration = Math.floor((Math.random() * 10) * 60000)
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate (the object is empty)', () => {
            it('should throw a ValidationException', () => {
                if (activity.heart_rate) activity.heart_rate = new PhysicalActivityHeartRate()
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: ' +
                        'average, out_of_range_zone, fat_burn_zone, cardio_zone, peak_zone is required!')
                }
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate (the average parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate = new PhysicalActivityHeartRateMock()
                activity.heart_rate.average = -120
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Average field is invalid...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: The value provided has a negative value!')
                }
                activity.heart_rate.average = 120
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Out of Range Zone" parameter is undefined)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.out_of_range_zone = undefined
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: out_of_range_zone is required!')
                }
                activity.heart_rate!.out_of_range_zone = out_of_range_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Fat Burn Zone" parameter is undefined)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.fat_burn_zone = undefined
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: fat_burn_zone is required!')
                }
                activity.heart_rate!.fat_burn_zone = fat_burn_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Cardio Zone" parameter is undefined)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.cardio_zone = undefined
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: cardio_zone is required!')
                }
                activity.heart_rate!.cardio_zone = cardio_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Peak Zone" parameter is undefined)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.peak_zone = undefined
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'PhysicalActivityHeartRate validation failed: peak_zone is required!')
                }
                activity.heart_rate!.peak_zone = peak_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Fat Burn Zone" parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.fat_burn_zone = new HeartRateZone()
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'HeartRateZone validation failed: min, max, duration is required!')
                }
                activity.heart_rate!.fat_burn_zone = fat_burn_zone_aux
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate ' +
            '(the "Fat Burn Zone" parameter has a negative duration)', () => {
            it('should throw a ValidationException', () => {
                activity.heart_rate!.fat_burn_zone!.duration = -600000
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'HeartRateZone validation failed: The value provided has a negative value!')
                }
                activity.heart_rate!.fat_burn_zone!.duration = 600000
            })
        })
    })
})
