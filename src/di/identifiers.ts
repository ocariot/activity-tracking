/**
 * Constants used in dependence injection.
 *
 * @abstract
 */
export abstract class Identifier {
    public static readonly APP: any = Symbol.for('App')

    // Controllers
    public static readonly HOME_CONTROLLER: any = Symbol.for('HomeController')
    public static readonly ACTIVITY_CONTROLLER: any = Symbol.for('ActivityController')
    public static readonly SLEEP_CONTROLLER: any = Symbol.for('SleepController')
    public static readonly ENVIRONMENT_CONTROLLER: any = Symbol.for('EnvironmentController')

    // Services
    public static readonly ACTIVITY_SERVICE: any = Symbol.for('PhysicalActivityService')
    public static readonly SLEEP_SERVICE: any = Symbol.for('SleepService')
    public static readonly ENVIRONMENT_SERVICE: any = Symbol.for('EnvironmentService')

    // Repositories
    public static readonly ACTIVITY_REPOSITORY: any = Symbol.for('PhysicalActivityRepository')
    public static readonly SLEEP_REPOSITORY: any = Symbol.for('SleepRepository')
    public static readonly ENVIRONMENT_REPOSITORY: any = Symbol.for('EnvironmentRepository')
    public static readonly INTEGRATION_EVENT_REPOSITORY: any = Symbol.for('IntegrationEventRepository')

    // Models
    public static readonly ACTIVITY_REPO_MODEL: any = Symbol.for('ActivityRepoModel')
    public static readonly SLEEP_REPO_MODEL: any = Symbol.for('SleepRepoModel')
    public static readonly ENVIRONMENT_REPO_MODEL: any = Symbol.for('EnvironmentRepoModel')
    public static readonly INTEGRATION_EVENT_REPO_MODEL: any = Symbol.for('IntegrationEventRepoModel')

    // Mappers
    public static readonly ACTIVITY_ENTITY_MAPPER: any = Symbol.for('PhysicalActivityEntityMapper')
    public static readonly ENVIRONMENT_ENTITY_MAPPER: any = Symbol.for('EnvironmentEntityMapper')
    public static readonly SLEEP_ENTITY_MAPPER: any = Symbol.for('SleepEntityMapper')

    // Background Services
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('EventBusRabbitMQ')
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryRabbitMQ')
    public static readonly RABBITMQ_CONNECTION: any = Symbol.for('ConnectionRabbitMQ')
    public static readonly MONGODB_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryMongoDB')
    public static readonly MONGODB_CONNECTION: any = Symbol.for('ConnectionMongoDB')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')

    // Tasks
    public static readonly EVENT_BUS_TASK: any = Symbol.for('EventBusTask')

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')
}
