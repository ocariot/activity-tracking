import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { UpdatePhysicalActivityValidator } from '../../../src/application/domain/validator/update.physical.activity.validator'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { PhysicalActivityHeartRateMock } from '../../mocks/physical.activity.heart.rate.mock'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

const activity: PhysicalActivityMock = new PhysicalActivityMock()
activity.start_time = undefined
activity.end_time = undefined
activity.duration = undefined
activity.levels = []
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
        /**
         * PhysicalActivity parameters
         */
        context('when the physical activity has an invalid parameter (negative calories)', () => {
            it('should throw a ValidationException', () => {
                activity.calories = -200
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
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
                    UpdatePhysicalActivityValidator.validate(activity)
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
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'distance'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                activity.distance = 1000
            })
        })

        context('when the physical activity has an invalid PhysicalActivityHeartRate (the object is empty)', () => {
            it('should throw a ValidationException', () => {
                if (activity.heart_rate) activity.heart_rate = new PhysicalActivityHeartRate()
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
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
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.average'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.out_of_range_zone'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.cardio_zone'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.peak_zone'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
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
                    UpdatePhysicalActivityValidator.validate(activity)
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
