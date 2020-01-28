import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { MeasurementMock } from '../../mocks/measurement.mock'
import { Measurement } from '../../../src/application/domain/model/measurement'
import { CreateMeasurementValidator } from '../../../src/application/domain/validator/create.measurement.validator'

const measurement: Measurement = new MeasurementMock()

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
                measurement.type = undefined
                try {
                    CreateMeasurementValidator.validate(measurement)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type'))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type, timestamp, value, unit, child_id'))
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
    })
})
