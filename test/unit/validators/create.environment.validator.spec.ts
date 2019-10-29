import { assert } from 'chai'
import { CreateEnvironmentValidator } from '../../../src/application/domain/validator/create.environment.validator'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Strings } from '../../../src/utils/strings'
import { Location } from '../../../src/application/domain/model/location'
import { Measurement } from '../../../src/application/domain/model/measurement'

const environment: Environment = new EnvironmentMock()
const institution_id_aux: string = environment.institution_id!
const location_aux: Location = environment.location!
const measurements_aux: Array<Measurement> = environment.measurements!
const timestamp_aux: Date = environment.timestamp
const local_aux: string = environment.location!.local
const room_aux: string = environment.location!.room

describe('Validators: CreateEnvironmentValidator', () => {
    describe('validate(environment: Environment)', () => {
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'institution_id'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'timestamp, institution_id, location, measurements'
                        .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
            })
        })

        context('when the environment has an invalid institution_id', () => {
            it('should throw a ValidationException', () => {
                environment.institution_id = '5a62be07de34500146d9c5442'
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
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
                if (environment.location) {
                    environment.location.local = undefined!
                    environment.location.room = undefined!
                }
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'location.local, location.room'
                        .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                environment.location.local = local_aux
                environment.location.room = room_aux
            })
        })

        context('when the environment has an empty measurement array', () => {
            it('should throw a ValidationException', () => {
                environment.measurements = new Array<Measurement>()
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description, 'measurements collection must not be empty!')
                }
                environment.measurements = measurements_aux
            })
        })

        context('when the environment has an invalid measurement (invalid type)', () => {
            it('should throw a ValidationException', () => {
                environment.measurements![1].type = 'Temperatures'
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'The type of measurement provided "temperatures" is not supported...')
                    assert.equal(err.description,
                        'The types allowed are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')
                }
                environment.measurements = measurements_aux
            })
        })

        context('when the environment has an invalid measurement (missing one of the fields, the unit)', () => {
            it('should throw a ValidationException', () => {
                const measurement: Measurement = new Measurement()
                measurement.type = 'temperature'
                measurement.value = 40
                environment.measurements![1] = measurement
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'measurements.unit'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                environment.measurements = measurements_aux
            })
        })

        context('when the environment has an invalid measurement (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                environment.measurements![1] = new Measurement()
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, 'measurements.type, measurements.value, measurements.unit'
                        .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                }
                environment.measurements = measurements_aux
            })
        })
    })
})
