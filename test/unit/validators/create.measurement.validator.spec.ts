import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { MeasurementMock } from '../../mocks/measurement.mock'
import { Measurement } from '../../../src/application/domain/model/measurement'
import { CreateMeasurementValidator } from '../../../src/application/domain/validator/create.measurement.validator'

const measurement: Measurement = new MeasurementMock()
const type_aux: string = measurement.type!

describe('Validators: CreateMeasurementValidator', () => {
    describe('validate(measurement: Measurement)', () => {
        context('when the measurement has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateMeasurementValidator.validate(measurement)
                assert.equal(result, undefined)
            })
        })

        context('when the measurement does not have all the required parameters (in this case missing type)', () => {
            it('should throw a ValidationException', () => {
                measurement.type = ''
                try {
                    CreateMeasurementValidator.validate(measurement)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Measurement validation failed: type is required!')
                }
            })
        })

        context('when the measurement does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                measurement.timestamp = undefined
                measurement.value = undefined
                measurement.unit = undefined
                measurement.child_id = undefined
                try {
                    CreateMeasurementValidator.validate(measurement)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Measurement validation failed: type, timestamp, value, unit, child_id is required!')
                }
            })
        })

        context('when the measurement has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                measurement.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateMeasurementValidator.validate(measurement)
                } catch (err) {
                    assert.equal(err.message, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the measurement has an invalid type', () => {
            it('should throw a ValidationException', () => {
                measurement.type = 'invalid_type'
                try {
                    CreateMeasurementValidator.validate(measurement)
                } catch (err) {
                    assert.equal(err.message, 'The type of measurement provided "invalid_type" is not supported...')
                    assert.equal(err.description, 'The allowed types are: temperature, humidity, body_fat, weight.')
                }
                measurement.type = type_aux
            })
        })
    })
})
