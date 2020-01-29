import { assert } from 'chai'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { PhysicalActivityHeartRateMock } from '../../mocks/physical.activity.heart.rate.mock'
import { PhysicalActivityHeartRateValidator } from '../../../src/application/domain/validator/physical.activity.heart.rate.validator'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { Strings } from '../../../src/utils/strings'

let activityHeartRate: PhysicalActivityHeartRate = new PhysicalActivityHeartRateMock()
const out_of_range_zone_aux = activityHeartRate.out_of_range_zone
const fat_burn_zone_aux = activityHeartRate.fat_burn_zone
const cardio_zone_aux = activityHeartRate.cardio_zone
const peak_zone_aux = activityHeartRate.peak_zone

describe('Validators: PhysicalActivityHeartRateValidator', () => {
    describe('validate(heartRate: PhysicalActivityHeartRate)', () => {
        context('when the weight has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                assert.equal(result, undefined)
            })
        })

        context('when the PhysicalActivityHeartRate does not have all the required parameters (in this case missing average)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.average = undefined
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.average'))
                }
            })
        })

        context('when the PhysicalActivityHeartRate does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate = new PhysicalActivityHeartRate()
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.average, heart_rate.out_of_range_zone, ' +
                            'heart_rate.fat_burn_zone, heart_rate.cardio_zone, heart_rate.peak_zone'))
                }
            })
        })

        context('when the PhysicalActivityHeartRate has a negative average parameter', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate = new PhysicalActivityHeartRateMock()
                activityHeartRate.average = -120
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.average'))
                }
                activityHeartRate.average = 120
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Out of Range Zone" parameter (the parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.out_of_range_zone = new HeartRateZone()
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.out_of_range_zone.min, ' +
                            'heart_rate.out_of_range_zone.max, heart_rate.out_of_range_zone.duration'))
                }
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Fat Burn Zone" parameter (the parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.out_of_range_zone = out_of_range_zone_aux
                activityHeartRate.fat_burn_zone = new HeartRateZone()
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.fat_burn_zone.min, heart_rate.fat_burn_zone.max, ' +
                            'heart_rate.fat_burn_zone.duration'))
                }
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Cardio Zone" parameter (the parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.fat_burn_zone = fat_burn_zone_aux
                activityHeartRate.cardio_zone = new HeartRateZone()
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.cardio_zone.min, heart_rate.cardio_zone.max, ' +
                            'heart_rate.cardio_zone.duration'))
                }
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Peak Zone" parameter (the parameter is empty)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.cardio_zone = cardio_zone_aux
                activityHeartRate.peak_zone = new HeartRateZone()
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'heart_rate.peak_zone.min, heart_rate.peak_zone.max, ' +
                            'heart_rate.peak_zone.duration'))
                }
                activityHeartRate.peak_zone = peak_zone_aux
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Out of Range Zone" parameter (the min parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.out_of_range_zone!.min = -30
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.out_of_range_zone.min'))
                }
                activityHeartRate.out_of_range_zone!.min = 30

            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Out of Range Zone" parameter (the max parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.out_of_range_zone!.max = -91
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.out_of_range_zone.max'))
                }
                activityHeartRate.out_of_range_zone!.max = 91

            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Out of Range Zone" parameter ' +
            '(the duration parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.out_of_range_zone!.duration = -60000
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                        .replace('{0}', 'heart_rate.out_of_range_zone.duration'))
                }
                activityHeartRate.out_of_range_zone!.duration = 60000

            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Fat Burn Zone" parameter (the min parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.fat_burn_zone!.min = -91
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.fat_burn_zone.min'))
                }
                activityHeartRate.fat_burn_zone!.min = 91
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Fat Burn Zone" parameter (the max parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.fat_burn_zone!.max = -127
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.fat_burn_zone.max'))
                }
                activityHeartRate.fat_burn_zone!.max = 127
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Fat Burn Zone" parameter (the duration parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.fat_burn_zone!.duration = -600000
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                        .replace('{0}', 'heart_rate.fat_burn_zone.duration'))
                }
                activityHeartRate.fat_burn_zone!.duration = 600000
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Cardio Zone" parameter (the min parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.cardio_zone!.min = -127
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.cardio_zone.min'))
                }
                activityHeartRate.cardio_zone!.min = 127
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Cardio Zone" parameter (the max parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.cardio_zone!.max = -154
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.cardio_zone.max'))
                }
                activityHeartRate.cardio_zone!.max = 154
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Cardio Zone" parameter (the duration parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.cardio_zone!.duration = -60000
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                        .replace('{0}', 'heart_rate.cardio_zone.duration'))
                }
                activityHeartRate.cardio_zone!.duration = 60000
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Peak Zone" parameter (the min parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.peak_zone!.min = -154
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.peak_zone.min'))
                }
                activityHeartRate.peak_zone!.min = 154
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Peak Zone" parameter (the max parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.peak_zone!.max = -220
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                        .replace('{0}', 'heart_rate.peak_zone.max'))
                }
                activityHeartRate.peak_zone!.max = 220
            })
        })

        context('when the PhysicalActivityHeartRate has an invalid "Peak Zone" parameter (the duration parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityHeartRate.peak_zone!.duration = -60000
                try {
                    PhysicalActivityHeartRateValidator.validate(activityHeartRate)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                        .replace('{0}', 'heart_rate.peak_zone.duration'))
                }
                activityHeartRate.peak_zone!.duration = 60000
            })
        })
    })
})
