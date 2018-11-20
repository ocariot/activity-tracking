import 'reflect-metadata'
import { Container } from 'inversify'
import { HomeController } from '../ui/controller/home.controller'
import { Identifier } from './identifiers'
import { ActivityController } from '../ui/controller/activity.controller'
import { IActivityService } from '../application/port/activity.service.interface'
import { ActivityService } from '../application/service/activity.service'
import { IActivityRepository } from '../application/port/activity.repository.interface'
import { ActivityRepository } from '../infrastructure/repository/activity.repository'
import { UserEntity } from '../infrastructure/entity/user.entity'
import { ActivityEntity } from '../infrastructure/entity/activity.entity'
import { ActivityRepoModel } from '../infrastructure/database/schema/activity.schema'
import { UserEntityMapper } from '../infrastructure/entity/mapper/user.entity.mapper'
import { ActivityEntityMapper } from '../infrastructure/entity/mapper/activity.entity.mapper'
import { IEntityMapper } from '../infrastructure/entity/mapper/entity.mapper.interface'
import { User } from '../application/domain/model/user'
import { RabbitMQConnectionFactory } from '../infrastructure/eventbus/rabbitmq/rabbitmp.connection.factory'
import { RabbitMQConnection } from '../infrastructure/eventbus/rabbitmq/rabbitmq.connection'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbittmq'
import { MongoDBConnectionFactory } from '../infrastructure/database/mongodb.connection.factory'
import { MongoDBConnection } from '../infrastructure/database/mongodb.connection'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { IRabbitMQConnection } from '../infrastructure/port/rabbitmq.connection.interface'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { Activity } from '../application/domain/model/activity'
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

export class DI {
    private static instance: DI
    private readonly container: Container

    /**
     * Creates an instance of DI.
     *
     * @private
     */
    private constructor() {
        this.container = new Container()
        this.initDependencies()
    }

    /**
     * Recover single instance of class.
     *
     * @static
     * @return {App}
     */
    public static getInstance(): DI {
        if (!this.instance) this.instance = new DI()
        return this.instance
    }

    /**
     * Get Container inversify.
     *
     * @returns {Container}
     */
    public getContainer(): Container {
        return this.container
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
        this.container.bind<EnvironmentController>(Identifier.ENVIRONMENT_CONTROLLER).to(EnvironmentController).inSingletonScope()
        this.container.bind<SleepController>(Identifier.SLEEP_CONTROLLER).to(SleepController).inSingletonScope()

        // Services
        this.container.bind<IActivityService>(Identifier.ACTIVITY_SERVICE).to(ActivityService).inSingletonScope()
        this.container.bind<IEnvironmentService>(Identifier.ENVIRONMENT_SERVICE).to(EnvironmentService).inSingletonScope()
        this.container.bind<ISleepService>(Identifier.SLEEP_SERVICE).to(SleepService).inSingletonScope()

        // Repositories
        this.container
            .bind<IActivityRepository>(Identifier.ACTIVITY_REPOSITORY)
            .to(ActivityRepository).inSingletonScope()
        this.container
            .bind<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY)
            .to(EnvironmentRepository).inSingletonScope()
        this.container
            .bind<ISleepRepository>(Identifier.SLEEP_REPOSITORY)
            .to(SleepRepository).inSingletonScope()

        // Models
        this.container.bind(Identifier.USER_ENTITY).toConstantValue(UserEntity)
        this.container.bind(Identifier.ACTIVITY_ENTITY).toConstantValue(ActivityEntity)
        this.container.bind(Identifier.ENVIRONMENT_ENTITY).toConstantValue(EnvironmentEntity)
        this.container.bind(Identifier.SLEEP_ENTITY).toConstantValue(SleepEntity)
        this.container.bind(Identifier.ACTIVITY_REPO_MODEL).toConstantValue(ActivityRepoModel)
        this.container.bind(Identifier.ENVIRONMENT_REPO_MODEL).toConstantValue(EnvironmentRepoModel)
        // this.container.bind(Identifier.SLEEP_REPO_MODEL).toConstantValue(SleepR)

        // Mappers
        this.container
            .bind<IEntityMapper<User, UserEntity>>(Identifier.USER_ENTITY_MAPPER)
            .to(UserEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Activity, ActivityEntity>>(Identifier.ACTIVITY_ENTITY_MAPPER)
            .to(ActivityEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Environment, EnvironmentEntity>>(Identifier.ENVIRONMENT_ENTITY_MAPPER)
            .to(EnvironmentEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<Sleep, SleepEntity>>(Identifier.SLEEP_ENTITY_MAPPER)
            .to(SleepEntityMapper).inSingletonScope()

        // Background Services
        this.container
            .bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(RabbitMQConnectionFactory).inSingletonScope()
        this.container
            .bind<IRabbitMQConnection>(Identifier.RABBITMQ_CONNECTION)
            .to(RabbitMQConnection).inSingletonScope()
        this.container
            .bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this.container
            .bind<IConnectionFactory>(Identifier.MONGODB_CONNECTION_FACTORY)
            .to(MongoDBConnectionFactory).inSingletonScope()
        this.container
            .bind<IDBConnection>(Identifier.MONGODB_CONNECTION)
            .to(MongoDBConnection).inSingletonScope()
        this.container
            .bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()

        // Log
        this.container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}
