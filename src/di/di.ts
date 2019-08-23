import 'reflect-metadata'
import { Container } from 'inversify'
import { HomeController } from '../ui/controller/home.controller'
import { Identifier } from './identifiers'
import { ActivityController } from '../ui/controller/activity.controller'
import { IPhysicalActivityService } from '../application/port/physical.activity.service.interface'
import { PhysicalActivityService } from '../application/service/physical.activity.service'
import { IPhysicalActivityRepository } from '../application/port/physical.activity.repository.interface'
import { PhysicalActivityRepository } from '../infrastructure/repository/physical.activity.repository'
import { ActivityEntity } from '../infrastructure/entity/activity.entity'
import { ActivityRepoModel } from '../infrastructure/database/schema/activity.schema'
import { PhysicalActivityEntityMapper } from '../infrastructure/entity/mapper/physical.activity.entity.mapper'
import { ConnectionFactoryRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.factory.rabbitmq'
import { ConnectionRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.rabbitmq'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { ConnectionFactoryMongoDB } from '../infrastructure/database/connection.factory.mongodb'
import { ConnectionMongoDB } from '../infrastructure/database/connection.mongodb'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IConnectionEventBus } from '../infrastructure/port/connection.event.bus.interface'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { PhysicalActivity } from '../application/domain/model/physical.activity'
import { BackgroundService } from '../background/background.service'
import { App } from '../app'
import { CustomLogger, ILogger } from '../utils/custom.logger'
import { EnvironmentService } from '../application/service/environment.service'
import { IEnvironmentService } from '../application/port/environment.service.interface'
import { IEnvironmentRepository } from '../application/port/environment.repository.interface'
import { EnvironmentRepository } from '../infrastructure/repository/environment.repository'
import { EnvironmentEntity } from '../infrastructure/entity/environment.entity'
import { EnvironmentRepoModel } from '../infrastructure/database/schema/environment.schema'
import { Environment } from '../application/domain/model/environment'
import { EnvironmentEntityMapper } from '../infrastructure/entity/mapper/environment.entity.mapper'
import { EnvironmentController } from '../ui/controller/environment.controller'
import { SleepController } from '../ui/controller/sleep.controller'
import { ISleepService } from '../application/port/sleep.service.interface'
import { SleepService } from '../application/service/sleep.service'
import { ISleepRepository } from '../application/port/sleep.repository.interface'
import { SleepRepository } from '../infrastructure/repository/sleep.repository'
import { SleepEntity } from '../infrastructure/entity/sleep.entity'
import { Sleep } from '../application/domain/model/sleep'
import { SleepEntityMapper } from '../infrastructure/entity/mapper/sleep.entity.mapper'
import { SleepRepoModel } from '../infrastructure/database/schema/sleep.schema'
import { IEntityMapper } from '../infrastructure/port/entity.mapper.interface'
import { IIntegrationEventRepository } from '../application/port/integration.event.repository.interface'
import { IntegrationEventRepository } from '../infrastructure/repository/integration.event.repository'
import { IntegrationEventRepoModel } from '../infrastructure/database/schema/integration.event.schema'
import { EventBusTask } from '../background/task/eventbus.task'
import { LogRepoModel } from '../infrastructure/database/schema/log.schema'
import { ILogRepository } from '../application/port/log.repository.interface'
import { LogRepository } from '../infrastructure/repository/log.repository'
import { Log } from '../application/domain/model/log'
import { LogEntity } from '../infrastructure/entity/log.entity'
import { LogEntityMapper } from '../infrastructure/entity/mapper/log.entity.mapper'
import { LogService } from '../application/service/log.service'
import { ILogService } from '../application/port/log.service.interface'
import { IBodyFatService } from '../application/port/body.fat.service.interface'
import { IWeightService } from '../application/port/weight.service.interface'
import { IBodyFatRepository } from '../application/port/body.fat.repository.interface'
import { IWeightRepository } from '../application/port/weight.repository.interface'
import { BodyFat } from '../application/domain/model/body.fat'
import { BodyFatEntity } from '../infrastructure/entity/body.fat.entity'
import { BodyFatEntityMapper } from '../infrastructure/entity/mapper/body.fat.entity.mapper'
import { Weight } from '../application/domain/model/weight'
import { WeightEntity } from '../infrastructure/entity/weight.entity'
import { MeasurementRepoModel } from '../infrastructure/database/schema/measurement.schema'
import { WeightEntityMapper } from '../infrastructure/entity/mapper/weight.entity.mapper'
import { BodyFatRepository } from '../infrastructure/repository/body.fat.repository'
import { WeightRepository } from '../infrastructure/repository/weight.repository'
import { BodyFatService } from '../application/service/body.fat.service'
import { WeightService } from '../application/service/weight.service'
import { BodyFatController } from '../ui/controller/body.fat.controller'
import { WeightController } from '../ui/controller/weight.controller'
import { LogController } from '../ui/controller/log.controller'

export class IoC {
    private readonly _container: Container

    /**
     * Creates an instance of DI.
     *
     * @private
     */
    constructor() {
        this._container = new Container()
        this.initDependencies()
    }

    /**
     * Get Container inversify.
     *
     * @returns {Container}
     */
    get container(): Container {
        return this._container
    }

    /**
     * Initializes injectable containers.
     *
     * @private
     * @return void
     */
    private initDependencies(): void {
        this.container.bind(Identifier.APP).to(App).inSingletonScope()

        // Controllers
        this.container.bind<HomeController>(Identifier.HOME_CONTROLLER).to(HomeController).inSingletonScope()
        this.container.bind<ActivityController>(Identifier.ACTIVITY_CONTROLLER).to(ActivityController).inSingletonScope()
        this.container.bind<LogController>(Identifier.LOG_CONTROLLER).to(LogController).inSingletonScope()
        this.container.bind<EnvironmentController>(Identifier.ENVIRONMENT_CONTROLLER).to(EnvironmentController).inSingletonScope()
        this.container.bind<SleepController>(Identifier.SLEEP_CONTROLLER).to(SleepController).inSingletonScope()
        this.container.bind<BodyFatController>(Identifier.BODY_FAT_CONTROLLER).to(BodyFatController).inSingletonScope()
        this.container.bind<WeightController>(Identifier.WEIGHT_CONTROLLER).to(WeightController).inSingletonScope()

        // Services
        this.container.bind<IPhysicalActivityService>(Identifier.ACTIVITY_SERVICE).to(PhysicalActivityService).inSingletonScope()
        this.container.bind<ILogService>(Identifier.LOG_SERVICE).to(LogService).inSingletonScope()
        this.container.bind<IEnvironmentService>(Identifier.ENVIRONMENT_SERVICE).to(EnvironmentService).inSingletonScope()
        this.container.bind<ISleepService>(Identifier.SLEEP_SERVICE).to(SleepService).inSingletonScope()
        this.container.bind<IBodyFatService>(Identifier.BODY_FAT_SERVICE).to(BodyFatService).inSingletonScope()
        this.container.bind<IWeightService>(Identifier.WEIGHT_SERVICE).to(WeightService).inSingletonScope()

        // Repositories
        this.container
            .bind<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY)
            .to(PhysicalActivityRepository).inSingletonScope()
        this.container
            .bind<ILogRepository>(Identifier.LOG_REPOSITORY)
            .to(LogRepository).inSingletonScope()
        this.container
            .bind<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY)
            .to(EnvironmentRepository).inSingletonScope()
        this.container
            .bind<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
            .to(SleepRepository).inSingletonScope()
        this.container
            .bind<IBodyFatRepository>(Identifier.BODY_FAT_REPOSITORY)
            .to(BodyFatRepository).inSingletonScope()
        this.container
            .bind<IWeightRepository>(Identifier.WEIGHT_REPOSITORY)
            .to(WeightRepository).inSingletonScope()
        this.container
            .bind<IIntegrationEventRepository>(Identifier.INTEGRATION_EVENT_REPOSITORY)
            .to(IntegrationEventRepository).inSingletonScope()

        // Models
        this.container.bind(Identifier.ACTIVITY_REPO_MODEL).toConstantValue(ActivityRepoModel)
        this.container.bind(Identifier.LOG_REPO_MODEL).toConstantValue(LogRepoModel)
        this.container.bind(Identifier.ENVIRONMENT_REPO_MODEL).toConstantValue(EnvironmentRepoModel)
        this.container.bind(Identifier.SLEEP_REPO_MODEL).toConstantValue(SleepRepoModel)
        this.container.bind(Identifier.MEASUREMENT_REPO_MODEL).toConstantValue(MeasurementRepoModel)
        this.container.bind(Identifier.INTEGRATION_EVENT_REPO_MODEL).toConstantValue(IntegrationEventRepoModel)

        // Mappers
        this.container
            .bind<IEntityMapper<PhysicalActivity, ActivityEntity>>(Identifier.ACTIVITY_ENTITY_MAPPER)
            .to(PhysicalActivityEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Log, LogEntity>>(Identifier.LOG_ENTITY_MAPPER)
            .to(LogEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Environment, EnvironmentEntity>>(Identifier.ENVIRONMENT_ENTITY_MAPPER)
            .to(EnvironmentEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Sleep, SleepEntity>>(Identifier.SLEEP_ENTITY_MAPPER)
            .to(SleepEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<BodyFat, BodyFatEntity>>(Identifier.BODY_FAT_ENTITY_MAPPER)
            .to(BodyFatEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Weight, WeightEntity>>(Identifier.WEIGHT_ENTITY_MAPPER)
            .to(WeightEntityMapper).inSingletonScope()

        // Background Services
        this.container
            .bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(ConnectionFactoryRabbitMQ).inSingletonScope()
        this.container
            .bind<IConnectionEventBus>(Identifier.RABBITMQ_CONNECTION)
            .to(ConnectionRabbitMQ)
        this.container
            .bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this.container
            .bind<IConnectionFactory>(Identifier.MONGODB_CONNECTION_FACTORY)
            .to(ConnectionFactoryMongoDB).inSingletonScope()
        this.container
            .bind<IConnectionDB>(Identifier.MONGODB_CONNECTION)
            .to(ConnectionMongoDB).inSingletonScope()
        this.container
            .bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()

        // Tasks
        this.container
            .bind(Identifier.EVENT_BUS_TASK)
            .to(EventBusTask).inRequestScope()

        // Log
        this.container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}

export const DIContainer = new IoC().container
