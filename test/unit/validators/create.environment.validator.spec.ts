import { assert } from 'chai'
import { CreateEnvironmentValidator } from '../../../src/application/domain/validator/create.environment.validator'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Strings } from '../../../src/utils/strings'
import { Location } from '../../../src/application/domain/model/location'
import { Humidity } from '../../../src/application/domain/model/humidity'
import { Temperature } from '../../../src/application/domain/model/temperature'
import { TemperatureMock } from '../../mocks/temperature.mock'
import { HumidityMock } from '../../mocks/humidity.mock'

const environment: Environment = new EnvironmentMock()
const institution_id_aux: string = environment.institution_id!
const location_aux: Location = environment.location!
const temperature_aux: Temperature = environment.temperature!
const humidity_aux: Humidity = environment.humidity!
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
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Validation of environment failed: institution_id required!')
                }
            })
        })

        context('when the environment does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                environment.location = undefined
                environment.temperature = undefined
                environment.timestamp = undefined!
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Validation of environment failed: timestamp, ' +
                        'institution_id, location, temperature required!')
                }
            })
        })

        context('when the environment has an invalid institution_id', () => {
            it('should throw a ValidationException', () => {
                environment.institution_id = '5a62be07de34500146d9c5442'
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'Some ID provided, does not have a valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the environment has an invalid location', () => {
            it('should throw a ValidationException', () => {
                environment.institution_id = institution_id_aux
                environment.location = location_aux
                environment.temperature = temperature_aux
                environment.timestamp = timestamp_aux
                if (environment.location) {
                    environment.location.local = ''
                    environment.location.room = ''
                }
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'Location are not in a format that is supported...')
                    assert.equal(err.description, 'Validation of location failed: location local, location room is required!')
                }
                environment.location.local = local_aux
                environment.location.room = room_aux
            })
        })

        context('when the environment has an empty temperature measurement', () => {
            it('should throw a ValidationException', () => {
                environment.temperature = new Temperature()
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Validation of environment failed: temperature.value, temperature.unit required!')
                }
                environment.temperature = temperature_aux
            })
        })

        context('when the environment has a temperature with an invalid type', () => {
            it('should throw a ValidationException', () => {
                const incorrectTemp: Temperature = new TemperatureMock()
                incorrectTemp.type = 'temperatures'
                environment.temperature = incorrectTemp
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'The type of temperature provided "temperatures" is not supported...')
                    assert.equal(err.description, 'The type allowed is "temperature".')
                }
                environment.temperature = temperature_aux
            })
        })

        context('when the environment has an empty humidity measurement', () => {
            it('should throw a ValidationException', () => {
                environment.humidity = new Humidity()
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Validation of environment failed: humidity.value, humidity.unit required!')
                }
                environment.humidity = humidity_aux
            })
        })

        context('when the environment has a humidity with an invalid type', () => {
            it('should throw a ValidationException', () => {
                const incorrectHumidity: Humidity = new HumidityMock()
                incorrectHumidity.type = 'humiditys'
                environment.humidity = incorrectHumidity
                try {
                    CreateEnvironmentValidator.validate(environment)
                } catch (err) {
                    assert.equal(err.message, 'The type of humidity provided "humiditys" is not supported...')
                    assert.equal(err.description, 'The type allowed is: "humidity".')
                }
                environment.humidity = humidity_aux
            })
        })
    })
})
