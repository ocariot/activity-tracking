import sinon from 'sinon'
// import { assert } from 'chai'
// import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentService } from '../../../src/application/service/environment.service'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EnvironmentRepository } from '../../../src/infrastructure/repository/environment.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IntegrationEventRepository } from '../../../src/infrastructure/repository/integration.event.repository'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { ConnectionRabbitMQ } from '../../../src/infrastructure/eventbus/rabbitmq/connection.rabbitmq'
import { ConnectionFactoryRabbitMQ } from '../../../src/infrastructure/eventbus/rabbitmq/connection.factory.rabbitmq'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
// import { assert } from 'chai'

require('sinon-mongoose')

describe('Services: Environment', () => {
    const environment: Environment = new EnvironmentMock()
    // const environmentAux: Environment = environment

    const modelFake: any = EnvironmentRepoModel
    const environmentRepo: IEnvironmentRepository = new EnvironmentRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepository(modelFake)

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQ()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitMQ(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitMQ(connectionFactoryRabbitmq)

    const environmentService: EnvironmentService = new EnvironmentService(environmentRepo, integrationRepo,
        new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('add(environment: Environment)', () => {
        context('when the Environment is correct and does not yet exist in the repository', () => {
            it('should return the Environment that was added', async () => {
                await environmentService.add(environment)
            })
        })

        context('when the Environment is correct but already exists in the repository', () => {
            it('should not normally execute the method', async () => {
                await environmentService.add(environment)
            })
        })
    })
})
