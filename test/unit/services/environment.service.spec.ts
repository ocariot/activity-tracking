import HttpStatus from 'http-status-codes'
import sinon from 'sinon'
import { assert } from 'chai'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentService } from '../../../src/application/service/environment.service'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { EnvironmentRepositoryMock } from '../../mocks/environment.repository.mock'
import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { Strings } from '../../../src/utils/strings'
import { Environment } from '../../../src/application/domain/model/environment'
import { Measurement, MeasurementType } from '../../../src/application/domain/model/measurement'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { MultiStatusMock } from '../../mocks/multi.status.mock'

require('sinon-mongoose')

describe('Services: Environment', () => {
    // Environment Mock
    const environment: Environment = new EnvironmentMock()
    let incorrectEnvironment: Environment = new Environment()       // For incorrect operations

    // For GET route
    const environmentsArrGet: Array<Environment> = new Array<EnvironmentMock>()
    for (let i = 0; i < 3; i++) {
        environmentsArrGet.push(new EnvironmentMock())
    }

    /**
     * For POST route with multiple environments
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

    const incorrectEnv4: Environment = new EnvironmentMock()   // Measurement invalid (empty array)
    incorrectEnv4.measurements = new Array<Measurement>()

    const incorrectEnv5: Environment = new EnvironmentMock()   // Measurement invalid (type)
    incorrectEnv5.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                  new Measurement('Temperatures', 40, '°C')]

    const incorrectEnv6: Environment = new EnvironmentMock()   // Measurement invalid (missing fields)
    incorrectEnv6.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                  new Measurement()]

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
    incorrectEnvironmentsArr.push(incorrectEnv6)

    /**
     * Mock MultiStatus responses
     */
    // MultiStatus totally correct
    const multiStatusCorrect: MultiStatus<Environment> = new MultiStatusMock<Environment>(correctEnvironmentsArr)
    const multiStatusMixed: MultiStatus<Environment> = new MultiStatusMock<Environment>(mixedEnvironmentsArr)    // Mixed MultiStatus
    // MultiStatus totally incorrect
    const multiStatusIncorrect: MultiStatus<Environment> = new MultiStatusMock<Environment>(incorrectEnvironmentsArr)

    const modelFake: any = EnvironmentRepoModel
    const environmentRepo: IEnvironmentRepository = new EnvironmentRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const environmentService: EnvironmentService = new EnvironmentService(environmentRepo, integrationRepo,
        eventBusRabbitmq, customLogger)

    before(async () => {
        try {
            await connectionRabbitmqPub.tryConnect(0, 500)
            await connectionRabbitmqSub.tryConnect(0, 500)
        } catch (err) {
            throw new Error('Failure on EnvironmentService unit test: ' + err.message)
        }
    })

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(environment: Environment | Array<Environment>)" with Environment argument
     */
    describe('add(environment: Environment | Array<Environment>) with Environment argument', () => {
        context('when the Environment is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the Environment that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .chain('exec')
                    .resolves(environment)

                return environmentService.add(environment)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as Environment
                        assert.propertyVal(result, 'id', environment.id)
                        assert.propertyVal(result, 'institution_id', environment.institution_id)
                        assert.propertyVal(result, 'location', environment.location)
                        if (result.climatized) assert.propertyVal(result, 'climatized', environment.climatized)
                        assert.propertyVal(result, 'timestamp', environment.timestamp)
                        assert.propertyVal(result, 'measurements', environment.measurements)
                    })
            })
        })

        context('when the Environment is correct and does not yet exist in the repository but there is no connection ' +
            'to the RabbitMQ', () => {
            it('should return the Environment that was saved', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .chain('exec')
                    .resolves(environment)

                return environmentService.add(environment)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as Environment
                        assert.propertyVal(result, 'id', environment.id)
                        assert.propertyVal(result, 'institution_id', environment.institution_id)
                        assert.propertyVal(result, 'location', environment.location)
                        if (result.climatized) assert.propertyVal(result, 'climatized', environment.climatized)
                        assert.propertyVal(result, 'timestamp', environment.timestamp)
                        assert.propertyVal(result, 'measurements', environment.measurements)
                    })
            })
        })

        context('when the Environment is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                connectionRabbitmqPub.isConnected = true
                environment.id = '507f1f77bcf86cd799439011'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .chain('exec')
                    .rejects({ message: 'Measurement of environment is already registered...' })

                return environmentService.add(environment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Measurement of environment is already registered...')
                    })
            })
        })

        context('when the Environment is incorrect (missing fields)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Validation of environment measurements failed: timestamp, institution_id, ' +
                                   'location, measurements required!' })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Validation of environment measurements failed: timestamp, ' +
                            'institution_id, location, measurements required!')
                    })
            })
        })

        context('when the Environment is incorrect (the institution_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectEnvironment = new EnvironmentMock()
                incorrectEnvironment.institution_id = '507f1f77bcf86cd7994390112'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Environment is incorrect (the location is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectEnvironment.institution_id = '507f1f77bcf86cd799439011'
                incorrectEnvironment.location!.local = ''
                incorrectEnvironment.location!.room = ''
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: 'Location are not in a format that is supported...',
                               description: 'Validation of location failed: location local, location room is required!' })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Location are not in a format that is supported...')
                        assert.propertyVal(err, 'description', 'Validation of location failed: location local, location room is required!')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array is empty)', () => {
            it('should throw a ValidationException', () => {
                incorrectEnvironment.location!.local = 'Indoor'
                incorrectEnvironment.location!.room = 'Room 01'
                incorrectEnvironment.measurements = new Array<Measurement>()
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: 'Measurement are not in a format that is supported!',
                               description: 'The measurements collection must not be empty!' })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Measurement are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'The measurements collection must not be empty!')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array has an item with invalid type)', () => {
            it('should throw a ValidationException', () => {
                incorrectEnvironment.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                            new Measurement('Temperatures', 40, '°C')]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: 'The type of measurement provided "temperatures" is not supported...',
                               description: 'The types allowed are: temperature, humidity.' })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'The type of measurement provided "temperatures" is not supported...')
                        assert.propertyVal(err, 'description', 'The types allowed are: temperature, humidity.')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array has an item with empty fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectEnvironment.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                            new Measurement()]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironment)
                    .chain('exec')
                    .rejects({ message: 'Measurement are not in a format that is supported!',
                               description: 'Validation of measurements failed: measurement type, measurement value, ' +
                                   'measurement unit is required!' })

                return environmentService.add(incorrectEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Measurement are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'Validation of measurements failed: measurement type, ' +
                            'measurement value, measurement unit is required!')
                    })
            })
        })
    })

    /**
     * Method "add(environment: Environment | Array<Environment>)" with Array<Environment> argument
     */
    describe('add(environment: Environment | Array<Environment>) with Array<Environment> argument', () => {
        context('when all the Environments of the array are correct, they still do not exist in the repository and there is ' +
            'a connection to the RabbitMQ', () => {
            it('should create each environment and return a response of type MultiStatus<Environment> with the description of success' +
                ' in sending each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctEnvironmentsArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return environmentService.add(correctEnvironmentsArr)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as MultiStatus<Environment>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctEnvironmentsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'institution_id', correctEnvironmentsArr[i].institution_id)
                            assert.propertyVal(result.success[i].item, 'location', correctEnvironmentsArr[i].location)
                            if (result.success[i].item.climatized)
                                assert.propertyVal(result.success[i].item, 'climatized', correctEnvironmentsArr[i].climatized)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctEnvironmentsArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'measurements', correctEnvironmentsArr[i].measurements)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Environments of the array are correct, they still do not exist in the repository but there is no ' +
            'a connection to the RabbitMQ', () => {
            it('should save each environment for submission attempt later to the bus and return a response of type ' +
                'MultiStatus<Environment> with the description of success in each one of them', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctEnvironmentsArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return environmentService.add(correctEnvironmentsArr)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as MultiStatus<Environment>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctEnvironmentsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'institution_id', correctEnvironmentsArr[i].institution_id)
                            assert.propertyVal(result.success[i].item, 'location', correctEnvironmentsArr[i].location)
                            if (result.success[i].item.climatized)
                                assert.propertyVal(result.success[i].item, 'climatized', correctEnvironmentsArr[i].climatized)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctEnvironmentsArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'measurements', correctEnvironmentsArr[i].measurements)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Environments of the array are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<Environment> with the description of conflict in each one of them', () => {
                connectionRabbitmqPub.isConnected = true

                correctEnvironmentsArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctEnvironmentsArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return environmentService.add(correctEnvironmentsArr)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as MultiStatus<Environment>

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', 'Measurement of environment is already registered...')
                            assert.propertyVal(result.error[i].item, 'id', correctEnvironmentsArr[i].id)
                            assert.propertyVal(result.error[i].item, 'institution_id', correctEnvironmentsArr[i].institution_id)
                            assert.propertyVal(result.error[i].item, 'location', correctEnvironmentsArr[i].location)
                            if (result.error[i].item.climatized)
                                assert.propertyVal(result.error[i].item, 'climatized', correctEnvironmentsArr[i].climatized)
                            assert.propertyVal(result.error[i].item, 'timestamp', correctEnvironmentsArr[i].timestamp)
                            assert.propertyVal(result.error[i].item, 'measurements', correctEnvironmentsArr[i].measurements)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when there are correct and incorrect Enviroments in the array and there is a connection to the RabbitMQ', () => {
            it('should create each correct Environment and return a response of type MultiStatus<Environment> with the ' +
                'description of success and error in each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedEnvironmentsArr)
                    .chain('exec')
                    .resolves(multiStatusMixed)

                return environmentService.add(mixedEnvironmentsArr)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as MultiStatus<Environment>

                        assert.propertyVal(result.success[0], 'code', HttpStatus.CREATED)
                        assert.propertyVal(result.success[0].item, 'id', mixedEnvironmentsArr[0].id)
                        assert.propertyVal(result.success[0].item, 'institution_id', mixedEnvironmentsArr[0].institution_id)
                        assert.propertyVal(result.success[0].item, 'location', mixedEnvironmentsArr[0].location)
                        if (result.success[0].item.climatized)
                            assert.propertyVal(result.success[0].item, 'climatized', mixedEnvironmentsArr[0].climatized)
                        assert.propertyVal(result.success[0].item, 'timestamp', mixedEnvironmentsArr[0].timestamp)
                        assert.propertyVal(result.success[0].item, 'measurements', mixedEnvironmentsArr[0].measurements)

                        assert.propertyVal(result.error[0], 'code', HttpStatus.BAD_REQUEST)
                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Validation of environment measurements failed: timestamp, ' +
                            'institution_id, location, measurements required!')
                    })
            })
        })

        context('when all the Environments of the array are incorrect', () => {
            it('should return a response of type MultiStatus<Environment> with the description of error in each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectEnvironmentsArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return environmentService.add(incorrectEnvironmentsArr)
                    .then((result: Environment | MultiStatus<Environment>) => {
                        result = result as MultiStatus<Environment>

                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Validation of environment measurements failed: timestamp, ' +
                            'institution_id, location, measurements required!')
                        assert.propertyVal(result.error[1], 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[1], 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[2], 'message', 'Location are not in a format that is supported...')
                        assert.propertyVal(result.error[2], 'description', 'Validation of location failed: location local, location ' +
                            'room is required!')
                        assert.propertyVal(result.error[3], 'message', 'Measurement are not in a format that is supported!')
                        assert.propertyVal(result.error[3], 'description', 'The measurements collection must not be empty!')
                        assert.propertyVal(result.error[4], 'message', 'The type of measurement provided "temperatures" is not ' +
                            'supported...')
                        assert.propertyVal(result.error[4], 'description', 'The types allowed are: temperature, humidity.')
                        assert.propertyVal(result.error[5], 'message', 'Measurement are not in a format that is supported!')
                        assert.propertyVal(result.error[5], 'description', 'Validation of measurements failed: measurement type, ' +
                            'measurement value, measurement unit is required!')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', incorrectEnvironmentsArr[i].id)
                            assert.propertyVal(result.error[i].item, 'institution_id', incorrectEnvironmentsArr[i].institution_id)
                            assert.propertyVal(result.error[i].item, 'location', incorrectEnvironmentsArr[i].location)
                            if (result.error[i].item.climatized)
                                assert.propertyVal(result.error[i].item, 'climatized', incorrectEnvironmentsArr[i].climatized)
                            assert.propertyVal(result.error[i].item, 'timestamp', incorrectEnvironmentsArr[i].timestamp)
                            assert.propertyVal(result.error[i].item, 'measurements', incorrectEnvironmentsArr[i].measurements)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one environment object in the database that matches the query filters', () => {
            it('should return an Environment array', () => {
                const query: IQuery = new Query()
                query.filters = {
                    'timestamp': environment.timestamp,
                    'location.local': environment.location ? environment.location.local : undefined,
                    'location.room': environment.location ? environment.location.room : undefined,
                    'location.latitude': environment.location ? environment.location.latitude : undefined,
                    'location.longitude': environment.location ? environment.location.longitude : undefined
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(environmentsArrGet)

                return environmentService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no environment object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                environment.timestamp = new Date('2018-03-01T03:00:00.000Z')
                const query: IQuery = new Query()
                query.filters = {
                    'timestamp': environment.timestamp,
                    'location.local': environment.location ? environment.location.local : undefined,
                    'location.room': environment.location ? environment.location.room : undefined,
                    'location.latitude': environment.location ? environment.location.latitude : undefined,
                    'location.longitude': environment.location ? environment.location.longitude : undefined
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<EnvironmentMock>())

                return environmentService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })
    })

    /**
     * Method "remove(id: string)"
     */
    describe('remove(id: string)', () => {
        context('when there is an environment with the id used as parameter', () => {
            it('should return true', () => {
                environment.id = '507f1f77bcf86cd799439011'
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(environment.id)
                    .chain('exec')
                    .resolves(true)

                return environmentService.remove(environment.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no environment with the id used as parameter', () => {
            it('should return false', () => {
                environment.id = '5c6dd16ea1a67d0034e6108b'
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(environment.id)
                    .chain('exec')
                    .resolves(false)

                return environmentService.remove(environment.id!)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is an environment with the id used as parameter but there is no connection to the RabbitMQ', () => {
            it('should return true and save the event that will report the removal of the resource', () => {
                connectionRabbitmqPub.isConnected = false
                environment.id = '507f1f77bcf86cd799439011'
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(environment.id)
                    .chain('exec')
                    .resolves(true)

                return environmentService.remove(environment.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when the environment id is invalid', () => {
            it('should throw a ValidationException', () => {
                connectionRabbitmqPub.isConnected = true
                environment.id = '5c6dd16ea1a67d0034e6108b2'
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(environment.id)
                    .chain('exec')
                    .rejects({ message: Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return environmentService.remove(environment.id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                })
            })
        })
    })
})
