import { assert } from 'chai'
import { CreateEnvironmentValidator } from '../../../src/application/domain/validator/create.environment.validator'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Strings } from '../../../src/utils/strings'
import { Location } from '../../../src/application/domain/model/location'
import { Measurement, MeasurementType } from '../../../src/application/domain/model/measurement'

const environment: Environment = new EnvironmentMock()
const institution_id_aux: string = environment.institution_id!
const location_aux: Location = environment.location!
const measurements_aux: Array<Measurement> = environment.measurements!
const timestamp_aux: Date = environment.timestamp
const local_aux: string = environment.location!.local

describe('Validators: CreateEnvironmentValidator', () => {
    context('when the environment has all the required parameters, and that they have valid values', () => {
        it('should return undefined representing the success of the validation', () => {
            const result = CreateEnvironmentValidator.validate(environment)
            assert.equal(result, undefined)
        })
    })

    context('when the environment does not have all the required parameters (in this case missing institution_id)', () => {
        it('should throw a ValidationException', () => {
            environment.institution_id = undefined
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Validation of environment measurements failed: institution_id required!')
            }
        })
    })

    context('when the environment does not have any of the required parameters', () => {
        it('should throw a ValidationException', () => {
            environment.location = undefined
            environment.measurements = undefined
            environment.timestamp = undefined!
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Validation of environment measurements failed: timestamp, ' +
                    'institution_id, location, measurements required!')
            }
        })
    })

    context('when the environment has an invalid institution_id', () => {
        it('should throw a ValidationException', () => {
            environment.institution_id = '5a62be07de34500146d9c5442'
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Some ID provided, does not have a valid format!')
                assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
        })
    })

    context('when the environment has an invalid location', () => {
        it('should throw a ValidationException', () => {
            environment.institution_id = institution_id_aux
            environment.location = location_aux
            environment.measurements = measurements_aux
            environment.timestamp = timestamp_aux
            if (environment.location) environment.location.local = ''
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Location are not in a format that is supported...')
                assert.equal(err.description, 'Validation of location failed: location local is required!')
            }
            environment.location.local = local_aux
        })
    })

    context('when the environment has an empty measurement array', () => {
        it('should throw a ValidationException', () => {
            environment.measurements = new Array<Measurement>()
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Measurement are not in a format that is supported!')
                assert.equal(err.description, 'The measurements collection must not be empty!')
            }
            environment.measurements = measurements_aux
        })
    })

    context('when the environment has an invalid measurement (invalid type)', () => {
        it('should throw a ValidationException', () => {
            environment.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                        new Measurement('Temperatures', 40, '°C')]
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'The type of measurement provided "temperatures" is not supported...')
                assert.equal(err.description, 'The types allowed are: temperature, humidity.')
            }
            environment.measurements = measurements_aux
        })
    })

    context('when the environment has an invalid measurement (missing one of the fields, the unit)', () => {
        it('should throw a ValidationException', () => {
            const measurement: Measurement = new Measurement()
            measurement.type = MeasurementType.TEMPERATURE
            measurement.value = 40
            environment.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                        measurement]
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Measurement are not in a format that is supported!')
                assert.equal(err.description, 'Validation of measurements failed: measurement unit is required!')
            }
            environment.measurements = measurements_aux
        })
    })

    context('when the environment has an invalid measurement (missing all fields)', () => {
        it('should throw a ValidationException', () => {
            const measurement: Measurement = new Measurement()
            environment.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                        measurement]
            try {
                CreateEnvironmentValidator.validate(environment)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Measurement are not in a format that is supported!')
                assert.equal(err.description, 'Validation of measurements failed: measurement type,' +
                    ' measurement value, measurement unit is required!')
            }
            environment.measurements = measurements_aux
        })
    })
})
