import HttpStatus from 'http-status-codes'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Environment } from '../../../src/application/domain/model/environment'
import { Location } from '../../../src/application/domain/model/location'
import { expect } from 'chai'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { Strings } from '../../../src/utils/strings'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { Measurement } from '../../../src/application/domain/model/measurement'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: environments', () => {

    const defaultEnvironment: Environment = new EnvironmentMock()
    const defaultMeasurements: Array<Measurement> = defaultEnvironment.measurements!

    /**
     * Mock objects for POST route with multiple environments
     */
        // Array with correct environments
    const correctEnvironmentsArr: Array<Environment> = new Array<EnvironmentMock>()
    for (let i = 0; i < 3; i++) {
        const env: Environment = new EnvironmentMock()
        env.institution_id = defaultEnvironment.institution_id
        correctEnvironmentsArr.push(env)
    }

    // Incorrect environments
    const incorrectEnv1: Environment = new Environment()        // Without required fields
    incorrectEnv1.institution_id = defaultEnvironment.institution_id

    const incorrectEnv2: Environment = new EnvironmentMock()   // location invalid
    incorrectEnv2.location!.local = undefined!
    incorrectEnv2.location!.room = undefined!

    const incorrectEnv3: Environment = new EnvironmentMock()   // Measurement invalid (empty array)
    incorrectEnv3.measurements = new Array<Measurement>()

    const incorrectEnv4: Environment = new EnvironmentMock()   // Measurement invalid (missing fields)
    incorrectEnv4.measurements![2] = new Measurement()

    const incorrectEnv5: Environment = new EnvironmentMock()   // The timestamp is invalid
    incorrectEnv5.timestamp = new Date('2019-12-35T12:52:59Z')

    // Array with correct and incorrect environments
    const mixedEnvironmentsArr: Array<Environment> = new Array<EnvironmentMock>()
    const correctEnv: Environment = new EnvironmentMock()
    correctEnv.institution_id = defaultEnvironment.institution_id
    mixedEnvironmentsArr.push(correctEnv)
    mixedEnvironmentsArr.push(incorrectEnv1)

    // Array with only incorrect environments
    const incorrectEnvironmentsArr: Array<Environment> = new Array<EnvironmentMock>()
    incorrectEnvironmentsArr.push(incorrectEnv1)
    incorrectEnvironmentsArr.push(incorrectEnv2)
    incorrectEnvironmentsArr.push(incorrectEnv3)
    incorrectEnvironmentsArr.push(incorrectEnv4)
    incorrectEnvironmentsArr.push(incorrectEnv5)

    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

            await deleteAllEnvironments()
        } catch (err) {
            throw new Error('Failure on environments routes test: ' + err.message)
        }
    })
    // Delete all environments from the database
    after(async () => {
        try {
            await deleteAllEnvironments()
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on environments routes test: ' + err.message)
        }
    })
    /**
     * POST route with only one Environment in the body
     */
    describe('RABBITMQ PUBLISHER -> POST /v1/environments with only one Environment in the body', () => {
        context('when posting a new Environment with success and publishing it to the bus', () => {
            const body = {
                location: defaultEnvironment.location,
                measurements: defaultEnvironment.measurements,
                climatized: defaultEnvironment.climatized,
                timestamp: defaultEnvironment.timestamp
            }

            before(async () => {
                try {
                    await deleteAllEnvironments()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on environments test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the environment ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subSaveEnvironment(message => {
                        try {
                            expect(message.event_name).to.eql('EnvironmentSaveEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('environment')
                            expect(message.environment).to.have.property('id')
                            expect(message.environment.institution_id).to.eql(defaultEnvironment.institution_id)
                            expect(message.environment.location.local).to.eql(defaultEnvironment.location!.local)
                            expect(message.environment.location.room).to.eql(defaultEnvironment.location!.room)
                            expect(message.environment.location.latitude).to.eql(defaultEnvironment.location!.latitude)
                            expect(message.environment.location.longitude).to.eql(defaultEnvironment.location!.longitude)
                            let index = 0
                            for (const measurement of message.environment.measurements) {
                                expect(measurement.type).to.eql(defaultEnvironment.measurements![index].type)
                                expect(measurement.value).to.eql(defaultEnvironment.measurements![index].value)
                                expect(measurement.unit).to.eql(defaultEnvironment.measurements![index].unit)
                                index++
                            }
                            expect(message.environment.climatized).to.eql(defaultEnvironment.climatized)
                            expect(message.environment.timestamp).to.eql(defaultEnvironment.timestamp.toISOString())
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                            .send(body)
                            .set('Content-Type', 'application/json')
                            .expect(201)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('POST /v1/environments with only one Environment in the body', () => {
        context('when posting a new Environment with success (there is no connection to RabbitMQ)', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved Environment (and show an error log about unable to send ' +
                'SaveEnvironment event)', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body.location.local).to.eql(defaultEnvironment.location!.local)
                        expect(res.body.location.room).to.eql(defaultEnvironment.location!.room)
                        expect(res.body.location.latitude).to.eql(defaultEnvironment.location!.latitude)
                        expect(res.body.location.longitude).to.eql(defaultEnvironment.location!.longitude)
                        let index = 0
                        for (const measurement of res.body.measurements) {
                            expect(measurement.type).to.eql(defaultEnvironment.measurements![index].type)
                            expect(measurement.value).to.eql(defaultEnvironment.measurements![index].value)
                            expect(measurement.unit).to.eql(defaultEnvironment.measurements![index].unit)
                            index++
                        }
                        expect(res.body.climatized).to.eql(defaultEnvironment.climatized)
                        expect(res.body.timestamp).to.eql(defaultEnvironment.timestamp.toISOString())
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: defaultEnvironment.measurements,
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql(Strings.ENVIRONMENT.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs (missing required fields)', () => {
            it('should return status code 400 and info message about missing fields', () => {
                const body = {}

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'timestamp, location, measurements'))
                    })
            })
        })

        context('when a validation error occurs (institution_id is invalid)', () => {
            it('should return status code 400 and info message about the invalid institution_id', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/institutions/123/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when a validation error occurs (location is invalid, missing required fields)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: new Location(),
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'location.local, location.room'))
                    })
            })
        })

        context('when a validation error occurs (location local is empty)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: '',
                        room: defaultEnvironment.location!.room
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'location.local'))
                    })
            })
        })

        context('when a validation error occurs (location local is invalid)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: 123,
                        room: defaultEnvironment.location!.room
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'location.local'))
                    })
            })
        })

        context('when a validation error occurs (location room is empty)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: ''
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'location.room'))
                    })
            })
        })

        context('when a validation error occurs (location room is invalid)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: 123
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'location.room'))
                    })
            })
        })

        context('when a validation error occurs (location latitude is empty)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: defaultEnvironment.location!.room,
                        latitude: ''
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'location.latitude'))
                    })
            })
        })

        context('when a validation error occurs (location longitude is empty)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: defaultEnvironment.location!.room,
                        longitude: ''
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'location.longitude'))
                    })
            })
        })

        context('when a validation error occurs (measurements array is empty)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: new Array<Measurement>(),
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('measurements collection must not be empty!')
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has an empty type)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: [
                        {
                            type: '',
                            value: 32,
                            unit: '%'
                        },
                        {
                            type: 'temperature',
                            value: 38,
                            unit: '°C'
                        }
                    ],
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'measurements.type'))
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has an invalid type)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: [
                        {
                            type: 123,
                            value: 32,
                            unit: '%'
                        },
                        {
                            type: 'temperature',
                            value: 38,
                            unit: '°C'
                        }
                    ],
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'measurements.type'))
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has an invalid value)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: [
                        {
                            type: 'humidity',
                            value: '32a',
                            unit: '%'
                        },
                        {
                            type: 'temperature',
                            value: 38,
                            unit: '°C'
                        }
                    ],
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_NUMBER
                            .replace('{0}', 'measurements.value'))
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has an empty unit)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: [
                        {
                            type: 'humidity',
                            value: 32,
                            unit: ''
                        },
                        {
                            type: 'temperature',
                            value: 38,
                            unit: '°C'
                        }
                    ],
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'measurements.unit'))
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has an invalid unit)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                const body = {
                    location: defaultEnvironment.location,
                    measurements: [
                        {
                            type: 'humidity',
                            value: 32,
                            unit: '%'
                        },
                        {
                            type: 'temperature',
                            value: 38,
                            unit: 123
                        }
                    ],
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'measurements.unit'))
                    })
            })
        })

        context('when a validation error occurs (measurements array has an item that has missing required fields)', () => {
            it('should return status code 400 and info message about the invalid measurements array', () => {
                defaultMeasurements[1] = new Measurement()
                const body = {
                    location: defaultEnvironment.location,
                    measurements: defaultMeasurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'measurements.type, measurements.value, measurements.unit'))
                    })
            })
        })

        context('when a validation error occurs (climatized is invalid)', () => {
            it('should return status code 400 and info message about the invalid climatized', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: defaultEnvironment.location!.room
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: 'invalid_climatized',
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('climatized must be a boolean!')
                    })
            })
        })

        context('when a validation error occurs (timestamp is invalid)', () => {
            it('should return status code 400 and info message about the invalid timestamp', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: defaultEnvironment.location!.room
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: '2019-11-35T14:40:00Z'
                }

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT.
                        replace('{0}', '2019-11-35T14:40:00Z'))
                    })
            })
        })

        context('when a validation error occurs (institution id is invalid)', () => {
            it('should return status code 400 and info message about the invalid institution id', () => {
                const body = {
                    location: {
                        local: defaultEnvironment.location!.local,
                        room: defaultEnvironment.location!.room
                    },
                    measurements: defaultEnvironment.measurements,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post(`/v1/institutions/123/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * POST route with an environment array in the body
     */
    describe('POST /v1/environments with an environment array in the body', () => {
        context('when all the environments are correct and still do not exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 207, create each environment and return a response of type MultiStatus<Environment> ' +
                'with the description of success in sending each one of them', () => {
                const body: any = []

                correctEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        location: environment.location,
                        measurements: environment.measurements,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item).to.have.property('id')
                            expect(res.body.success[i].item.institution_id).to.eql(correctEnvironmentsArr[i].institution_id)
                            expect(res.body.success[i].item.location).to.eql(correctEnvironmentsArr[i].location!.toJSON())
                            let index = 0
                            for (const measurement of res.body.success[i].item.measurements) {
                                expect(measurement.type).to.eql(correctEnvironmentsArr[i].measurements![index].type)
                                expect(measurement.value).to.eql(correctEnvironmentsArr[i].measurements![index].value)
                                expect(measurement.unit).to.eql(correctEnvironmentsArr[i].measurements![index].unit)
                                index++
                            }
                            if (res.body.success[i].item.climatized)
                                expect(res.body.success[i].item.climatized).to.eql(correctEnvironmentsArr[i].climatized)
                            expect(res.body.success[i].item.timestamp).to.eql(correctEnvironmentsArr[i].timestamp.toISOString())
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the environments are correct but already exists in the repository', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    for (const environment of correctEnvironmentsArr) {
                        createEnvironment({
                            institution_id: environment.institution_id,
                            location: environment.location,
                            measurements: environment.measurements,
                            climatized: environment.climatized,
                            timestamp: environment.timestamp
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description ' +
                'of conflict in sending each one of them', () => {
                const body: any = []

                correctEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        location: environment.location,
                        measurements: environment.measurements,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql(Strings.ENVIRONMENT.ALREADY_REGISTERED)
                            expect(res.body.error[i].item.institution_id).to.eql(correctEnvironmentsArr[i].institution_id)
                            expect(res.body.error[i].item.location).to.eql(correctEnvironmentsArr[i].location!.toJSON())
                            let index = 0
                            for (const measurement of res.body.error[i].item.measurements) {
                                expect(measurement.type).to.eql(correctEnvironmentsArr[i].measurements![index].type)
                                expect(measurement.value).to.eql(correctEnvironmentsArr[i].measurements![index].value)
                                expect(measurement.unit).to.eql(correctEnvironmentsArr[i].measurements![index].unit)
                                index++
                            }
                            if (res.body.error[i].item.climatized)
                                expect(res.body.error[i].item.climatized).to.eql(correctEnvironmentsArr[i].climatized)
                            expect(res.body.error[i].item.timestamp).to.eql(correctEnvironmentsArr[i].timestamp.toISOString())
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there is correct and incorrect environments in the body', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description of ' +
                'success and error in each one of them', () => {
                const body: any = []

                mixedEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        location: environment.location,
                        measurements: environment.measurements,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item).to.have.property('id')
                        expect(res.body.success[0].item.institution_id).to.eql(mixedEnvironmentsArr[0].institution_id)
                        expect(res.body.success[0].item.location).to.eql(mixedEnvironmentsArr[0].location!.toJSON())
                        let index = 0
                        for (const measurement of res.body.success[0].item.measurements) {
                            expect(measurement.type).to.eql(mixedEnvironmentsArr[0].measurements![index].type)
                            expect(measurement.value).to.eql(mixedEnvironmentsArr[0].measurements![index].value)
                            expect(measurement.unit).to.eql(mixedEnvironmentsArr[0].measurements![index].unit)
                            index++
                        }
                        if (res.body.success[0].item.climatized)
                            expect(res.body.success[0].item.climatized).to.eql(mixedEnvironmentsArr[0].climatized)
                        expect(res.body.success[0].item.timestamp).to.eql(mixedEnvironmentsArr[0].timestamp.toISOString())

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[0].description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'timestamp, location, measurements'))
                    })
            })
        })

        context('when all the environments of the body are incorrect', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description of ' +
                'error in each one of them', () => {
                const body: any = []

                incorrectEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        location: environment.location,
                        measurements: environment.measurements,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.error[0].message)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[0].description)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'timestamp, location, measurements'))
                        expect(res.body.error[1].message)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[1].description)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'location.local, location.room'))
                        expect(res.body.error[2].message)
                            .to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[2].description)
                            .to.eql('measurements collection must not be empty!')
                        expect(res.body.error[3].message)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[3].description)
                            .to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'measurements.type, measurements.value, measurements.unit'))
                        expect(res.body.error[4].message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT.
                        replace('{0}', 'null'))
                        expect(res.body.error[4].description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT_DESC)

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            if (i !== 4) expect(res.body.error[i].item.institution_id).to.eql(defaultEnvironment.institution_id)
                            if (i === 1) {
                                expect(res.body.error[i].item.location.latitude)
                                    .to.eql(incorrectEnvironmentsArr[i].location!.latitude)
                                expect(res.body.error[i].item.location.longitude)
                                    .to.eql(incorrectEnvironmentsArr[i].location!.longitude)
                            } else if (i !== 0) {
                                expect(res.body.error[i].item.location)
                                    .to.eql(incorrectEnvironmentsArr[i].location!.toJSON())
                            }
                            if (res.body.error[i].item.climatized)
                                expect(res.body.error[i].item.climatized).to.eql(incorrectEnvironmentsArr[i].climatized)
                            if (i !== 0 && i !== 4) expect(res.body.error[i].item.timestamp)
                                .to.eql(incorrectEnvironmentsArr[i].timestamp.toISOString())
                            if (i !== 0 && i !== 2) {
                                let index = 0
                                for (const measurement of res.body.error[i].item.measurements) {
                                    expect(measurement.type).to.eql(incorrectEnvironmentsArr[i].measurements![index].type)
                                    expect(measurement.value).to.eql(incorrectEnvironmentsArr[i].measurements![index].value)
                                    expect(measurement.unit).to.eql(incorrectEnvironmentsArr[i].measurements![index].unit)
                                    index++
                                }
                            }
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * GET route
     */
    describe('GET /v1/environments', () => {
        context('when get all environment of the database successfully', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: [
                            {
                                type: 'temperature',
                                value: 25,
                                unit: '°C'
                            },
                            {
                                type: 'humidity',
                                value: 33,
                                unit: '%'
                            }
                        ],
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of environments found', () => {
                return request
                    .get(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body[0].location.local).to.eql(defaultEnvironment.location!.local)
                        expect(res.body[0].location.room).to.eql(defaultEnvironment.location!.room)
                        expect(res.body[0].location.latitude).to.eql(defaultEnvironment.location!.latitude)
                        expect(res.body[0].location.longitude).to.eql(defaultEnvironment.location!.longitude)
                        expect(res.body[0].measurements[0].type).to.eql('temperature')
                        expect(res.body[0].measurements[0].value).to.eql(25)
                        expect(res.body[0].measurements[0].unit).to.eql('°C')
                        expect(res.body[0].measurements[1].type).to.eql('humidity')
                        expect(res.body[0].measurements[1].value).to.eql(33)
                        expect(res.body[0].measurements[1].unit).to.eql('%')
                        expect(res.body[0].climatized).to.eql(defaultEnvironment.climatized)
                        expect(res.body[0].timestamp).to.eql(defaultEnvironment.timestamp.toISOString())
                    })
            })
        })

        context('when there are no environment in the database', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', () => {
                return request
                    .get(`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the institution id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid institution id', () => {
                return request
                    .get(`/v1/institutions/123/environments`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when use "query-strings-parser" library', () => {
            let result1

            before(async () => {
                try {
                    await deleteAllEnvironments()

                    result1 = await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: 'Indoor',
                            room: 'Room 40',
                            latitude: 34.54323217,
                            longitude: 7.54534798
                        },
                        measurements: [
                            {
                                type: 'humidity',
                                value: 32,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 38,
                                unit: '°C'
                            }
                        ],
                        climatized: false,
                        timestamp: new Date(1547953200000)
                    })

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: 'Indoor',
                            room: 'Room 39',
                            latitude: 34.54323217,
                            longitude: 7.54534798
                        },
                        measurements: [
                            {
                                type: 'humidity',
                                value: 32,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 38,
                                unit: '°C'
                            }
                        ],
                        climatized: false,
                        timestamp: new Date(1548007200000)
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 200 and the result as needed in the query ' +
                '(all the environment records of an institution in one day)', () => {
                const url = (`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .concat('?timestamp=gte:2019-01-20T00:00:00.000Z&timestamp=lt:2019-01-20T23:59:59.999Z')
                    .concat('&sort=institution_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const env of res.body) {
                            expect(env).to.have.property('id')
                            expect(env).to.have.property('institution_id')
                            expect(env).to.have.property('location')
                            expect(env).to.have.property('measurements')
                            expect(env).to.have.property('climatized')
                            expect(env).to.have.property('timestamp')
                        }
                    })
            })

            it('should return status code 200 and the result as needed in the query ' +
                '(all the environment records of a room in one day)', () => {
                const url = (`/v1/institutions/${defaultEnvironment.institution_id}/environments`)
                    .concat('?location.local=Indoor&location.room=Room 40')
                    .concat('&timestamp=gte:2019-01-20T00:00:00.000Z&timestamp=lt:2019-01-20T23:59:59.999Z')
                    .concat('&sort=institution_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body[0].location.local).to.eql('Indoor')
                        expect(res.body[0].location.room).to.eql('Room 40')
                        expect(res.body[0].location.latitude).to.eql('34.54323217')
                        expect(res.body[0].location.longitude).to.eql('7.54534798')
                        expect(res.body[0].measurements[0].type).to.eql('humidity')
                        expect(res.body[0].measurements[0].value).to.eql(32)
                        expect(res.body[0].measurements[0].unit).to.eql('%')
                        expect(res.body[0].measurements[1].type).to.eql('temperature')
                        expect(res.body[0].measurements[1].value).to.eql(38)
                        expect(res.body[0].measurements[1].unit).to.eql('°C')
                        expect(res.body[0].climatized).to.eql(false)
                        expect(res.body[0].timestamp).to.eql(result1.timestamp.toISOString())
                    })
            })

            it('should return status code 200 and an empty list (when no environment record is found)', () => {
                const url = `/v1/institutions/${defaultEnvironment.institution_id}/environments?`
                    .concat('?timestamp=gte:2017-01-20T00:00:00.000Z&timestamp=lt:2017-01-20T23:59:59.999Z')
                    .concat('&sort=institution_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * DELETE ALL route
     */
    describe('RABBITMQ PUBLISHER -> DELETE /v1/environments/:environment_id', () => {
        context('when the environments were deleted successfully and their IDs are published on the bus', () => {
            before(async () => {
                try {
                    const otherEnvironment: Environment = new EnvironmentMock()
                    await deleteAllEnvironments()

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 34,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 40,
                                unit: '°C'
                            }
                        ],
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: otherEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 33.7,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 39.8,
                                unit: '°C'
                            }
                        ],
                        climatized: otherEnvironment.climatized,
                        timestamp: otherEnvironment.timestamp
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on environments test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                let count = 1
                rabbitmq.bus
                    .subDeleteEnvironment(message => {
                        try {
                            expect(message.event_name).to.eql('EnvironmentDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('environment')
                            expect(message.environment[0]).to.have.property('id')
                            expect(message.environment[1]).to.have.property('id')
                            if (++count === 2) done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/institutions/${defaultEnvironment.institution_id}/environments/`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/environments/:environment_id', () => {
        context('when the environments were deleted successfully (there is no connection to RabbitMQ)', () => {
            before(async () => {
                try {
                    const otherEnvironment: Environment = new EnvironmentMock()
                    await deleteAllEnvironments()

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 34,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 40,
                                unit: '°C'
                            }
                        ],
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: otherEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 34,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 40,
                                unit: '°C'
                            }
                        ],
                        climatized: otherEnvironment.climatized,
                        timestamp: otherEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 204 and no content for environments (and show an error log about unable to send ' +
                'DeleteEnvironment events)', () => {
                return request
                    .delete(`/v1/institutions/${defaultEnvironment.institution_id}/environments/`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution has no environments associated with it', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for environment', () => {
                return request
                    .delete(`/v1/institutions/${defaultEnvironment.institution_id}/environments/`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })
        })

        context('when the institution id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid institution id', () => {
                return request
                    .delete('/v1/institutions/123/environments/')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * DELETE route
     */
    describe('RABBITMQ PUBLISHER -> DELETE /v1/environments/:environment_id', () => {
        context('when the environment was deleted successfully and your ID is published on the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllEnvironments()

                    result = await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 34,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 40,
                                unit: '°C'
                            }
                        ],
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on environments test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subDeleteEnvironment(message => {
                        try {
                            expect(message.event_name).to.eql('EnvironmentDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('environment')
                            expect(message.environment).to.have.property('id')
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/institutions/${result.institution_id}/environments/${result.id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/environments/:environment_id', () => {
        context('when the environment was deleted successfully (there is no connection to RabbitMQ)', () => {
            let result

            before(async () => {
                try {
                    await deleteAllEnvironments()

                    result = await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: defaultEnvironment.location,
                        measurements: [
                            {
                                type: 'humidity',
                                value: 34,
                                unit: '%'
                            },
                            {
                                type: 'temperature',
                                value: 40,
                                unit: '°C'
                            }
                        ],
                        climatized: defaultEnvironment.climatized,
                        timestamp: defaultEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })
            it('should return status code 204 and no content for environment (and show an error log about unable to send ' +
                'DeleteEnvironment event)', () => {
                return request
                    .delete(`/v1/institutions/${result.institution_id}/environments/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the environment is not found', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for environment', () => {
                return request
                    .delete(`/v1/institutions/${defaultEnvironment.institution_id}/environments/${defaultEnvironment.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })
        })

        context('when the institution id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid institution id', () => {
                return request
                    .delete(`/v1/institutions/123/environments/${defaultEnvironment.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the environment id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid environment id', () => {
                return request
                    .delete(`/v1/institutions/${defaultEnvironment.institution_id}/environments/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})

async function createEnvironment(item): Promise<any> {
    const environmentMapper: EnvironmentEntityMapper = new EnvironmentEntityMapper()
    const resultModel = environmentMapper.transform(item)
    const resultModelEntity = environmentMapper.transform(resultModel)
    return await Promise.resolve(EnvironmentRepoModel.create(resultModelEntity))
}

async function deleteAllEnvironments() {
    return EnvironmentRepoModel.deleteMany({})
}
