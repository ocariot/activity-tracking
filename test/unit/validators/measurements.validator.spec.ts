import { assert } from 'chai'
import { Measurement, MeasurementType } from '../../../src/application/domain/model/measurement'
import { MeasurementsValidator } from '../../../src/application/domain/validator/measurements.validator'

let measurements: Array<Measurement> = [new Measurement(MeasurementType.TEMPERATURE, Math.random() * 13 + 19, '°C'),
                                        new Measurement(MeasurementType.HUMIDITY, Math.random() * 16 + 30, '%')]

describe('Validators: Measurements', () => {
    describe('validate(measurements: Array<Measurement>)', () => {
        context('when the measurements in array has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = MeasurementsValidator.validate(measurements)
                assert.equal(result, undefined)
            })
        })

        context('when the measurements array is empty', () => {
            it('should throw a ValidationException', () => {
                measurements = new Array<Measurement>()
                try {
                    MeasurementsValidator.validate(measurements)
                } catch (err) {
                    assert.equal(err.message, 'Measurement are not in a format that is supported!')
                    assert.equal(err.description, 'The measurements collection must not be empty!')
                }
                measurements = [new Measurement(MeasurementType.TEMPERATURE, Math.random() * 13 + 19, '°C'),
                    new Measurement(MeasurementType.HUMIDITY, Math.random() * 16 + 30, '%')]
            })
        })

        context('when the measurements array has an invalid measurement (invalid type)', () => {
            it('should throw a ValidationException', () => {
                measurements[1].type = 'Temperatures'
                try {
                    MeasurementsValidator.validate(measurements)
                } catch (err) {
                    assert.equal(err.message, 'The type of measurement provided "temperatures" is not supported...')
                    assert.equal(err.description, 'The types allowed are: temperature, humidity.')
                }
                measurements = [new Measurement(MeasurementType.TEMPERATURE, Math.random() * 13 + 19, '°C'),
                    new Measurement(MeasurementType.HUMIDITY, Math.random() * 16 + 30, '%')]
            })
        })

        context('when the measurements array has an invalid measurement (missing one of the fields, the unit)', () => {
            it('should throw a ValidationException', () => {
                measurements[1].unit = ''
                try {
                    MeasurementsValidator.validate(measurements)
                } catch (err) {
                    assert.equal(err.message, 'Measurement are not in a format that is supported!')
                    assert.equal(err.description, 'Validation of measurements failed: measurement unit is required!')
                }
                measurements = [new Measurement(MeasurementType.TEMPERATURE, Math.random() * 13 + 19, '°C'),
                    new Measurement(MeasurementType.HUMIDITY, Math.random() * 16 + 30, '%')]
            })
        })

        context('when the measurements array has an invalid measurement (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                measurements[1] = new Measurement()
                try {
                    MeasurementsValidator.validate(measurements)
                } catch (err) {
                    assert.equal(err.message, 'Measurement are not in a format that is supported!')
                    assert.equal(err.description, 'Validation of measurements failed: measurement type,' +
                        ' measurement value, measurement unit is required!')
                }
                measurements = [new Measurement(MeasurementType.TEMPERATURE, Math.random() * 13 + 19, '°C'),
                    new Measurement(MeasurementType.HUMIDITY, Math.random() * 16 + 30, '%')]
            })
        })
    })
})
