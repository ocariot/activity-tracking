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
    public static readonly LOG_CONTROLLER: any = Symbol.for('LogController')
    public static readonly SLEEP_CONTROLLER: any = Symbol.for('SleepController')
    public static readonly BODY_FAT_CONTROLLER: any = Symbol.for('BodyFatController')
    public static readonly WEIGHT_CONTROLLER: any = Symbol.for('WeightController')
    public static readonly ENVIRONMENT_CONTROLLER: any = Symbol.for('EnvironmentController')

    // Services
    public static readonly ACTIVITY_SERVICE: any = Symbol.for('PhysicalActivityService')
    public static readonly LOG_SERVICE: any = Symbol.for('LogService')
    public static readonly SLEEP_SERVICE: any = Symbol.for('SleepService')
    public static readonly BODY_FAT_SERVICE: any = Symbol.for('BodyFatService')
    public static readonly WEIGHT_SERVICE: any = Symbol.for('WeightService')
    public static readonly ENVIRONMENT_SERVICE: any = Symbol.for('EnvironmentService')

    // Repositories
    public static readonly ACTIVITY_REPOSITORY: any = Symbol.for('PhysicalActivityRepository')
    public static readonly LOG_REPOSITORY: any = Symbol.for('LogRepository')
    public static readonly SLEEP_REPOSITORY: any = Symbol.for('SleepRepository')
    public static readonly BODY_FAT_REPOSITORY: any = Symbol.for('BodyFatRepository')
    public static readonly WEIGHT_REPOSITORY: any = Symbol.for('WeightRepository')
    public static readonly ENVIRONMENT_REPOSITORY: any = Symbol.for('EnvironmentRepository')

    // Models
    public static readonly ACTIVITY_REPO_MODEL: any = Symbol.for('ActivityRepoModel')
    public static readonly LOG_REPO_MODEL: any = Symbol.for('LogRepoModel')
    public static readonly SLEEP_REPO_MODEL: any = Symbol.for('SleepRepoModel')
    public static readonly MEASUREMENT_REPO_MODEL: any = Symbol.for('MeasurementRepoModel')
    public static readonly ENVIRONMENT_REPO_MODEL: any = Symbol.for('EnvironmentRepoModel')

    // Mappers
    public static readonly ACTIVITY_ENTITY_MAPPER: any = Symbol.for('PhysicalActivityEntityMapper')
    public static readonly LOG_ENTITY_MAPPER: any = Symbol.for('LogEntityMapper')
    public static readonly ENVIRONMENT_ENTITY_MAPPER: any = Symbol.for('EnvironmentEntityMapper')
    public static readonly SLEEP_ENTITY_MAPPER: any = Symbol.for('SleepEntityMapper')
    public static readonly BODY_FAT_ENTITY_MAPPER: any = Symbol.for('BodyFatEntityMapper')
    public static readonly WEIGHT_ENTITY_MAPPER: any = Symbol.for('WeightEntityMapper')

    // Background Services
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('RabbitMQEventBus')
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryRabbitMQ')
    public static readonly MONGODB_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryMongoDB')
    public static readonly MONGODB_CONNECTION: any = Symbol.for('MongoDBConnection')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')

    // Tasks
    public static readonly SUB_EVENT_BUS_TASK: any = Symbol.for('SubEventBusTask')
    public static readonly PROVIDER_EVENT_BUS_TASK: any = Symbol.for('ProviderEventBusTask')

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')
}
