import HttpStatus from 'http-status-codes'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { BackgroundService } from '../../../src/background/background.service'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Environment } from '../../../src/application/domain/model/environment'
import { Location } from '../../../src/application/domain/model/location'
import { expect } from 'chai'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { Strings } from '../../../src/utils/strings'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { Temperature } from '../../../src/application/domain/model/temperature'
import { Humidity } from '../../../src/application/domain/model/humidity'

const container: Container = DI.getInstance().getContainer()
const backgroundServices: BackgroundService = container.get(Identifier.BACKGROUND_SERVICE)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: environments', () => {

    const defaultEnvironment: Environment = new EnvironmentMock()

    /**
     * Mock objects for POST route with multiple environments
     */
    // Array with correct environments
    const correctEnvironmentsArr: Array<Environment> = new Array<EnvironmentMock>()
    for (let i = 0; i < 3; i++) {
        correctEnvironmentsArr.push(new EnvironmentMock())
    }

    // Incorrect environments
    const incorrectEnv1: Environment = new Environment()        // Without required fields

    const incorrectEnv2: Environment = new EnvironmentMock()   // Institution id invalid
    incorrectEnv2.institution_id = '5c6dd16ea1a67d0034e6108bc'

    const incorrectEnv3: Environment = new EnvironmentMock()   // location invalid
    incorrectEnv3.location!.local = ''
    incorrectEnv3.location!.room = ''

    const incorrectEnv4: Environment = new EnvironmentMock()   // Temperature invalid (missing fields)
    incorrectEnv4.temperature = new Temperature()

    const incorrectEnv5: Environment = new EnvironmentMock()   // Humidity invalid (missing fields)
    incorrectEnv5.humidity = new Humidity()

    // Array with correct and incorrect environments
    const mixedEnvironmentsArr: Array<Environment> = new Array<EnvironmentMock>()
    mixedEnvironmentsArr.push(new EnvironmentMock())
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
            await backgroundServices.startServices()
        } catch (err) {
            throw new Error('Failure on environments routes test: ' + err.message)
        }
    })
    /**
     * POST route with only one Environment in the body
     */
    describe('POST /v1/environments with only one Environment in the body', () => {
        context('when posting a new Environment with success', () => {
            it('should return status code 201 and the saved Environment', () => {
                const body = {
                    institution_id: defaultEnvironment.institution_id,
                    location: defaultEnvironment.location,
                    temperature: defaultEnvironment.temperature,
                    humidity: defaultEnvironment.humidity,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        defaultEnvironment.id = res.body.id
                        expect(res.body.id).to.eql(defaultEnvironment.id)
                        expect(res.body.institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body.location.local).to.eql(defaultEnvironment.location!.local)
                        expect(res.body.location.room).to.eql(defaultEnvironment.location!.room)
                        expect(res.body.location.latitude).to.eql(defaultEnvironment.location!.latitude)
                        expect(res.body.location.longitude).to.eql(defaultEnvironment.location!.longitude)
                        expect(res.body.temperature.value).to.eql(defaultEnvironment.temperature!.value)
                        expect(res.body.temperature.unit).to.eql(defaultEnvironment.temperature!.unit)
                        expect(res.body.humidity.value).to.eql(defaultEnvironment.humidity!.value)
                        expect(res.body.humidity.unit).to.eql(defaultEnvironment.humidity!.unit)
                        expect(res.body.climatized).to.eql(defaultEnvironment.climatized)
                        expect(res.body.timestamp).to.eql(defaultEnvironment.timestamp.toISOString())
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    institution_id: defaultEnvironment.institution_id,
                    location: defaultEnvironment.location,
                    temperature: defaultEnvironment.temperature,
                    humidity: defaultEnvironment.humidity,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql('Measurement of environment is already registered...')
                    })
            })
        })

        context('when a validation error occurs (missing required fields)', () => {
            it('should return status code 400 and info message about missing fields', () => {
                const body = {
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Validation of environment failed: timestamp, institution_id, ' +
                            'location, temperature required!')
                    })
            })
        })

        context('when a validation error occurs (institution_id is invalid)', () => {
            it('should return status code 400 and info message about the invalid institution_id', () => {
                const body = {
                    institution_id: '5a62be07de34500146d9c5442',
                    location: defaultEnvironment.location,
                    temperature: defaultEnvironment.temperature,
                    humidity: defaultEnvironment.humidity,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Some ID provided, does not have a valid format!')
                        expect(err.body.description).to.eql('A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.')
                    })
            })
        })

        context('when a validation error occurs (location is invalid, missing required fields)', () => {
            it('should return status code 400 and info message about the invalid location', () => {
                const body = {
                    institution_id: defaultEnvironment.institution_id,
                    location: new Location(),
                    temperature: defaultEnvironment.temperature,
                    humidity: defaultEnvironment.humidity,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Location are not in a format that is supported...')
                        expect(err.body.description).to.eql('Validation of location failed: location local, location room is required!')
                    })
            })
        })

        context('when a validation error occurs (the temperature is invalid (missing fields))', () => {
            it('should return status code 400 and info message about the invalid temperature', () => {
                const body = {
                    institution_id: defaultEnvironment.institution_id,
                    location: defaultEnvironment.location,
                    temperature: new Temperature(),
                    humidity: defaultEnvironment.humidity,
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Validation of environment failed: temperature.value, ' +
                            'temperature.unit required!')
                    })
            })
        })

        context('when a validation error occurs (the humidity is invalid (missing fields))', () => {
            it('should return status code 400 and info message about the invalid humidity', () => {
                const body = {
                    institution_id: defaultEnvironment.institution_id,
                    location: defaultEnvironment.location,
                    temperature: defaultEnvironment.temperature,
                    humidity: new Humidity(),
                    climatized: defaultEnvironment.climatized,
                    timestamp: defaultEnvironment.timestamp
                }

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Validation of environment failed: humidity.value, ' +
                            'humidity.unit required!')
                    })
            })
        })
    })
    /**
     * POST route with an environment array in the body
     */
    describe('POST /v1/environments with an environment array in the body', () => {
        context('when all the environments are correct and still do not exist in the repository', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 201, create each environment and return a response of type MultiStatus<Environment> ' +
                'with the description of success in sending each one of them', () => {
                const body: any = []

                correctEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        id: environment.id,
                        institution_id: environment.institution_id,
                        location: environment.location,
                        temperature: environment.temperature,
                        humidity: environment.humidity,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.id).to.eql(correctEnvironmentsArr[i].id)
                            expect(res.body.success[i].item.institution_id).to.eql(correctEnvironmentsArr[i].institution_id)
                            expect(res.body.success[i].item.location).to.eql(correctEnvironmentsArr[i].location!.toJSON())
                            if (res.body.success[i].item.climatized)
                                expect(res.body.success[i].item.climatized).to.eql(correctEnvironmentsArr[i].climatized)
                            expect(res.body.success[i].item.timestamp).to.eql(correctEnvironmentsArr[i].timestamp.toISOString())
                            expect(res.body.success[i].item.temperature.value).to.eql(correctEnvironmentsArr[i].temperature!.value)
                            expect(res.body.success[i].item.temperature.unit).to.eql(correctEnvironmentsArr[i].temperature!.unit)
                            expect(res.body.success[i].item.humidity.value).to.eql(correctEnvironmentsArr[i].humidity!.value)
                            expect(res.body.success[i].item.humidity.unit).to.eql(correctEnvironmentsArr[i].humidity!.unit)
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the environments are correct but already exists in the repository', () => {
            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description ' +
                'of conflict in sending each one of them', () => {
                const body: any = []

                correctEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        id: environment.id,
                        institution_id: environment.institution_id,
                        location: environment.location,
                        temperature: environment.temperature,
                        humidity: environment.humidity,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql('Measurement of environment is already registered...')
                            expect(res.body.error[i].item.id).to.eql(correctEnvironmentsArr[i].id)
                            expect(res.body.error[i].item.institution_id).to.eql(correctEnvironmentsArr[i].institution_id)
                            expect(res.body.error[i].item.location).to.eql(correctEnvironmentsArr[i].location!.toJSON())
                            if (res.body.error[i].item.climatized)
                                expect(res.body.error[i].item.climatized).to.eql(correctEnvironmentsArr[i].climatized)
                            expect(res.body.error[i].item.timestamp).to.eql(correctEnvironmentsArr[i].timestamp.toISOString())
                            expect(res.body.error[i].item.temperature.value).to.eql(correctEnvironmentsArr[i].temperature!.value)
                            expect(res.body.error[i].item.temperature.unit).to.eql(correctEnvironmentsArr[i].temperature!.unit)
                            expect(res.body.error[i].item.humidity.value).to.eql(correctEnvironmentsArr[i].humidity!.value)
                            expect(res.body.error[i].item.humidity.unit).to.eql(correctEnvironmentsArr[i].humidity!.unit)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there is correct and incorrect environments in the body', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description of ' +
                'success and error in each one of them', () => {
                const body: any = []

                mixedEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        id: environment.id,
                        institution_id: environment.institution_id,
                        location: environment.location,
                        temperature: environment.temperature,
                        humidity: environment.humidity,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.id).to.eql(mixedEnvironmentsArr[0].id)
                        expect(res.body.success[0].item.institution_id).to.eql(mixedEnvironmentsArr[0].institution_id)
                        expect(res.body.success[0].item.location).to.eql(mixedEnvironmentsArr[0].location!.toJSON())
                        if (res.body.success[0].item.climatized)
                            expect(res.body.success[0].item.climatized).to.eql(mixedEnvironmentsArr[0].climatized)
                        expect(res.body.success[0].item.timestamp).to.eql(mixedEnvironmentsArr[0].timestamp.toISOString())
                        expect(res.body.success[0].item.temperature.value).to.eql(mixedEnvironmentsArr[0].temperature!.value)
                        expect(res.body.success[0].item.temperature.unit).to.eql(mixedEnvironmentsArr[0].temperature!.unit)
                        expect(res.body.success[0].item.humidity.value).to.eql(mixedEnvironmentsArr[0].humidity!.value)
                        expect(res.body.success[0].item.humidity.unit).to.eql(mixedEnvironmentsArr[0].humidity!.unit)

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Validation of environment failed: timestamp, ' +
                            'institution_id, location, temperature required!')
                    })
            })
        })

        context('when all the environments of the body are incorrect', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<Environment> with the description of ' +
                'error in each one of them', () => {
                const body: any = []

                incorrectEnvironmentsArr.forEach(environment => {
                    const bodyElem = {
                        id: environment.id,
                        institution_id: environment.institution_id,
                        location: environment.location,
                        temperature: environment.temperature,
                        humidity: environment.humidity,
                        climatized: environment.climatized,
                        timestamp: environment.timestamp
                    }
                    body.push(bodyElem)
                })

                return request
                    .post('/v1/environments')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Validation of environment failed: ' +
                            'timestamp, institution_id, location, temperature required!')
                        expect(res.body.error[1].message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(res.body.error[1].description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        expect(res.body.error[2].message).to.eql('Location are not in a format that is supported...')
                        expect(res.body.error[2].description).to.eql('Validation of location failed: ' +
                            'location local, location room is required!')
                        expect(res.body.error[3].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[3].description).to.eql('Validation of environment failed: ' +
                            'temperature.value, temperature.unit required!')
                        expect(res.body.error[4].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[4].description).to.eql('Validation of environment failed: ' +
                            'humidity.value, humidity.unit required!')

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].item.id).to.eql(incorrectEnvironmentsArr[i].id)
                            expect(res.body.error[i].item.institution_id).to.eql(incorrectEnvironmentsArr[i].institution_id)
                            if (i !== 0) expect(res.body.error[i].item.location).to.eql(incorrectEnvironmentsArr[i].location!.toJSON())
                            if (res.body.error[i].item.climatized)
                                expect(res.body.error[i].item.climatized).to.eql(incorrectEnvironmentsArr[i].climatized)
                            if (i !== 0) expect(res.body.error[i].item.timestamp)
                                .to.eql(incorrectEnvironmentsArr[i].timestamp.toISOString())
                            if (i !== 0 && i !== 3) {
                                expect(res.body.error[i].item.temperature.value).to.eql(incorrectEnvironmentsArr[i].temperature!.value)
                                expect(res.body.error[i].item.temperature.unit).to.eql(incorrectEnvironmentsArr[i].temperature!.unit)
                                expect(res.body.error[i].item.humidity.value).to.eql(incorrectEnvironmentsArr[i].humidity!.value)
                                expect(res.body.error[i].item.humidity.unit).to.eql(incorrectEnvironmentsArr[i].humidity!.unit)
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
            it('should return status code 200 and a list of environments found', async () => {
                try {
                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: 'Indoor',
                            room: 'room 01',
                            latitude: defaultEnvironment.location!.latitude,
                            longitude: defaultEnvironment.location!.longitude
                        },
                        temperature: {
                            value: defaultEnvironment.temperature!.value,
                            unit: '°C'
                        },
                        humidity: {
                            value: defaultEnvironment.humidity!.value,
                            unit: '%'
                        },
                        climatized: defaultEnvironment.climatized,
                        timestamp: new Date(2019)
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }

                return request
                    .get('/v1/environments')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultEnvironment.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of the successful POST route test or with the create method above).
                        expect(res.body[0].id).to.eql(defaultEnvironment.id)
                        expect(res.body[0].institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body[0].location.local).to.eql(defaultEnvironment.location!.local)
                        expect(res.body[0].location.room).to.eql(defaultEnvironment.location!.room)
                        expect(res.body[0].location.latitude).to.eql(defaultEnvironment.location!.latitude)
                        expect(res.body[0].location.longitude).to.eql(defaultEnvironment.location!.longitude)
                        expect(res.body[0].temperature.value).to.eql(defaultEnvironment.temperature!.value)
                        expect(res.body[0].temperature.unit).to.eql(defaultEnvironment.temperature!.unit)
                        expect(res.body[0].humidity.value).to.eql(defaultEnvironment.humidity!.value)
                        expect(res.body[0].humidity.unit).to.eql(defaultEnvironment.humidity!.unit)
                        expect(res.body[0].climatized).to.eql(defaultEnvironment.climatized)
                        expect(res.body[0].timestamp).to.eql((new Date(2019)).toISOString())
                    })
            })
        })

        context('when there are no environment in the database', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                return request
                    .get('/v1/environments')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get environment using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: 'Indoor',
                            room: 'room 01',
                            latitude: defaultEnvironment.location!.latitude,
                            longitude: defaultEnvironment.location!.longitude
                        },
                        temperature: {
                            value: defaultEnvironment.temperature!.value,
                            unit: '°C'
                        },
                        humidity: {
                            value: defaultEnvironment.humidity!.value,
                            unit: '%'
                        },
                        climatized: true,
                        timestamp: defaultEnvironment.timestamp
                    })

                    await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: 'indoor',
                            room: 'room 01',
                            latitude: '34.54323217',
                            longitude: '7.54534798'
                        },
                        temperature: {
                            value: defaultEnvironment.temperature!.value,
                            unit: '°C'
                        },
                        humidity: {
                            value: defaultEnvironment.humidity!.value,
                            unit: '%'
                        },
                        climatized: false,
                        timestamp: defaultEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }

                const url = '/v1/environments?climatized=true&fields=institution_id,location,temperature,humidity,' +
                    'climatized,timestamp&sort=institution_id&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultEnvironment.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of the successful POST route test or with the create method above)
                        // with the property 'climatized' = true (the only query filter)
                        expect(res.body[0].id).to.eql(defaultEnvironment.id)
                        expect(res.body[0].institution_id).to.eql(defaultEnvironment.institution_id)
                        expect(res.body[0].location.local).to.eql(defaultEnvironment.location!.local)
                        expect(res.body[0].location.room).to.eql(defaultEnvironment.location!.room)
                        expect(res.body[0].location.latitude).to.eql(defaultEnvironment.location!.latitude)
                        expect(res.body[0].location.longitude).to.eql(defaultEnvironment.location!.longitude)
                        expect(res.body[0].temperature.value).to.eql(defaultEnvironment.temperature!.value)
                        expect(res.body[0].temperature.unit).to.eql(defaultEnvironment.temperature!.unit)
                        expect(res.body[0].humidity.value).to.eql(defaultEnvironment.humidity!.value)
                        expect(res.body[0].humidity.unit).to.eql(defaultEnvironment.humidity!.unit)
                        expect(res.body[0].climatized).to.eql(true)
                        expect(res.body[0].timestamp).to.eql(defaultEnvironment.timestamp.toISOString())
                    })
            })
        })

        context('when there is an attempt to get environment using the "query-strings-parser" library but there is no ' +
            'environment in the database', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                const url = '/v1/environments?climatized=true&fields=institution_id,location,temperature,humidity,' +
                    'climatized,timestamp&sort=institution_id&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * DELETE route
     */
    describe('DELETE /v1/environments/:environment_id', () => {
        context('when the environment was deleted successfully', () => {
            it('should return status code 204 and no content for environment', async () => {
                let result

                try {
                    result = await createEnvironment({
                        institution_id: defaultEnvironment.institution_id,
                        location: {
                            local: (defaultEnvironment.location) ? defaultEnvironment.location.local : '',
                            room: (defaultEnvironment.location) ? defaultEnvironment.location.room : '',
                            latitude: (defaultEnvironment.location) ? defaultEnvironment.location.latitude : '',
                            longitude: (defaultEnvironment.location) ? defaultEnvironment.location.longitude : ''
                        },
                        temperature: {
                            value: defaultEnvironment.temperature!.value,
                            unit: '°C'
                        },
                        humidity: {
                            value: defaultEnvironment.humidity!.value,
                            unit: '%'
                        },
                        climatized: true,
                        timestamp: defaultEnvironment.timestamp
                    })
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/environments/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the environment is not found', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for environment', () => {
                return request
                    .delete(`/v1/environments/${defaultEnvironment.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(err => {
                        expect(err.body).to.eql({})
                    })
            })
        })

        context('when the environment id is invalid', () => {
            before(() => {
                try {
                    deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on environments routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid environment id', async () => {
                return request
                    .delete(`/v1/environments/123`)
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

function deleteAllEnvironments(): void {
    EnvironmentRepoModel.deleteMany({}, err => {
        if (err) console.log('err: ' + err)
    })
}
