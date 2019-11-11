import { assert } from 'chai'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneMock } from '../../mocks/heart.rate.zone.mock'
import { HeartRateZoneValidator } from '../../../src/application/domain/validator/heart.rate.zone.validator'
import { Strings } from '../../../src/utils/strings'

let heartRateZone: HeartRateZone = new HeartRateZoneMock()

describe('Validators: HeartRateZoneValidator', () => {
    describe('validate(heartRateZone: HeartRateZone)', () => {
        context('when the weight has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                assert.equal(result, undefined)
            })
        })

        context('when the HeartRateZone does not have all the required parameters (in this case missing average)', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.min = undefined
                try {
                    HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.min'
                        .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('when the HeartRateZone does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                heartRateZone = new HeartRateZone()
                try {
                    HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.min, heart_rate.fat_burn_zone.max, ' +
                        'heart_rate.fat_burn_zone.duration'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('when the HeartRateZone has a negative min value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone = new HeartRateZoneMock()
                heartRateZone.min = -91
                try {
                    HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.min'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                heartRateZone.min = 91
            })
        })

        context('when the HeartRateZone has a negative max value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.max = -127
                try {
                    HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.max'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                heartRateZone.max = 127
            })
        })

        context('when the HeartRateZone has a negative duration value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.duration = -60000
                try {
                    HeartRateZoneValidator.validate(heartRateZone, 'fat_burn_zone')
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'heart_rate.fat_burn_zone.duration'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                }
                heartRateZone.duration = 60000
            })
        })
    })
})
