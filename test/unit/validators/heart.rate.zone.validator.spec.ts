import { assert } from 'chai'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneMock } from '../../mocks/heart.rate.zone.mock'
import { HeartRateZoneValidator } from '../../../src/application/domain/validator/heart.rate.zone.validator'

let heartRateZone: HeartRateZone = new HeartRateZoneMock()

describe('Validators: HeartRateZoneValidator', () => {
    describe('validate(heartRateZone: HeartRateZone)', () => {
        context('when the weight has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = HeartRateZoneValidator.validate(heartRateZone)
                assert.equal(result, undefined)
            })
        })

        context('when the HeartRateZone does not have all the required parameters (in this case missing average)', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.min = undefined
                try {
                    HeartRateZoneValidator.validate(heartRateZone)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'HeartRateZone validation failed: min is required!')
                }
            })
        })

        context('when the HeartRateZone does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                heartRateZone = new HeartRateZone()
                try {
                    HeartRateZoneValidator.validate(heartRateZone)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'HeartRateZone validation failed: min, max, duration is required!')
                }
            })
        })

        context('when the HeartRateZone has a negative min value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone = new HeartRateZoneMock()
                heartRateZone.min = -91
                try {
                    HeartRateZoneValidator.validate(heartRateZone)
                } catch (err) {
                    assert.equal(err.message, 'Min field is invalid...')
                    assert.equal(err.description, 'HeartRateZone validation failed: The value provided has a negative value!')
                }
                heartRateZone.min = 91
            })
        })

        context('when the HeartRateZone has a negative max value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.max = -127
                try {
                    HeartRateZoneValidator.validate(heartRateZone)
                } catch (err) {
                    assert.equal(err.message, 'Max field is invalid...')
                    assert.equal(err.description, 'HeartRateZone validation failed: The value provided has a negative value!')
                }
                heartRateZone.max = 127
            })
        })

        context('when the HeartRateZone has a negative duration value', () => {
            it('should throw a ValidationException', () => {
                heartRateZone.duration = -60000
                try {
                    HeartRateZoneValidator.validate(heartRateZone)
                } catch (err) {
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'HeartRateZone validation failed: The value provided has a negative value!')
                }
                heartRateZone.duration = 60000
            })
        })
    })
})
