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

require('sinon-mongoose')

describe('Services: Environment', () => {
    const environment: EnvironmentMock = new EnvironmentMock()
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

    describe('add(environment: Environment)', () => {
        context('when the Environment is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the Environment that was added', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .resolves(environment)

                return await environmentService.add(environment)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when the Environment is correct and does not yet exist in the repository but there is no connection ' +
            'to the RabbitMQ', () => {
            it('should return the Environment that was saved', async () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .resolves(environment)

                return await environmentService.add(environment)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when the Environment is correct but already exists in the repository', () => {
            it('should throw a ConflictException', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(environment)
                    .rejects({ name: 'ConflictError' })

                return await environmentService.add(environment)
                    .catch(err => {
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'message', 'Measurement of environment is already registered...')
                    })
            })
        })
    })

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
