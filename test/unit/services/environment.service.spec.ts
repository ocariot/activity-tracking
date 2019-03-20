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

require('sinon-mongoose')

describe('Services: Environment', () => {
    const environment: EnvironmentMock = new EnvironmentMock()
    let environmentIncorrect: Environment = new Environment()
    const environmentArr: Array<EnvironmentMock> = new Array<EnvironmentMock>()
    for (let i = 0; i < 3; i++) {
        environmentArr.push(new EnvironmentMock())
    }

    const modelFake: any = EnvironmentRepoModel
    const environmentRepo: IEnvironmentRepository = new EnvironmentRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)

    const environmentService: EnvironmentService = new EnvironmentService(environmentRepo, integrationRepo,
        new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(environment: Environment)"
     */
    describe('add(environment: Environment)', () => {
        context('when the Environment is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the Environment that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .resolves(environment)

                return environmentService.add(environment)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .resolves(environment)

                return environmentService.add(environment)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when the Environment is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                environment.id = '507f1f77bcf86cd799439011'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .rejects({ name: 'ConflictError' })

                return environmentService.add(environment)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Measurement of environment is already registered...')
                    })
            })
        })

        context('when the Environment is incorrect (missing fields)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', 'Validation of environment measurements failed: timestamp, ' +
                            'institution_id, location, measurements required!')
                    })
            })
        })

        context('when the Environment is incorrect (the institution_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                environmentIncorrect = new EnvironmentMock()
                environmentIncorrect.institution_id = '507f1f77bcf86cd7994390112'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Environment is incorrect (the location is invalid)', () => {
            it('should throw a ValidationException', () => {
                environmentIncorrect.institution_id = '507f1f77bcf86cd799439011'
                environmentIncorrect.location!.local = ''
                environmentIncorrect.location!.room = ''
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Location are not in a format that is supported...')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', 'Validation of location failed: location local, location room is required!')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array is empty)', () => {
            it('should throw a ValidationException', () => {
                environmentIncorrect.location!.local = 'Indoor'
                environmentIncorrect.location!.room = 'Room 01'
                environmentIncorrect.measurements = new Array<Measurement>()
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Measurement are not in a format that is supported!')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', 'The measurements collection must not be empty!')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array has an item with invalid type)', () => {
            it('should throw a ValidationException', () => {
                environmentIncorrect.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                            new Measurement('Temperatures', 40, '°C')]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'The type of measurement provided "temperatures" is not supported...')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', 'The types allowed are: temperature, humidity.')
                    })
            })
        })

        context('when the Environment is incorrect (the measurements array has an item with empty fields)', () => {
            it('should throw a ValidationException', () => {
                environmentIncorrect.measurements = [new Measurement(MeasurementType.HUMIDITY, 34, '%'),
                                            new Measurement()]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environmentIncorrect)
                    .rejects({ name: 'ValidationError' })

                return environmentService.add(environmentIncorrect)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Measurement are not in a format that is supported!')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'description', 'Validation of measurements failed: measurement type, ' +
                            'measurement value, measurement unit is required!')
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
                    .resolves(environmentArr)

                return environmentService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
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
                    .resolves(new Array<EnvironmentMock>())

                return environmentService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .resolves(true)

                return environmentService.remove(environment.id!)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isBoolean(result)
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
                    .resolves(false)

                return environmentService.remove(environment.id!)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.equal(result, false)
                    })
            })
        })

        context('when the environment id is invalid', () => {
            it('should throw a ValidationException', () => {
                environment.id = '5c6dd16ea1a67d0034e6108b2'
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(environment.id)
                    .resolves(false)

                try {
                    return environmentService.remove(environment.id!)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.ENVIRONMENT.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })
})
