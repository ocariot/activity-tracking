/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Default {
    public static readonly APP_TITLE: string = 'Tracking Service'
    public static readonly APP_ID: string = 'tracking_service'
    public static readonly APP_DESCRIPTION: string = 'Micro-service for tracking physicalactivity, sleep and food.'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 3000
    public static readonly PORT_HTTPS: number = 3001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/nutes.ocariot/tracking-service/v1/swagger.json'
    public static readonly LOGO_URI: string = 'http://www.ocariot.com.br/wp-content/uploads/2018/08/cropped-512-32x32.png'

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://127.0.0.1:27017/tracking-service'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://127.0.0.1:27017/tracking-service-test'
    public static readonly MONGODB_CON_RETRY_COUNT: number = 0 // infinite
    public static readonly MONGODB_CON_RETRY_INTERVAL: number = 1000 // 1s

    // RabbitMQ
    public static readonly RABBITMQ_AMQP_URI: string = 'amqp://127.0.0.1:5672'
    public static readonly RABBITMQ_EXCHANGE_NAME: string = 'tracking-service'
    public static readonly RABBITMQ_QUEUE_NAME: string = 'tracking_queue'
    public static readonly RABBITMQ_CON_RETRY_COUNT: number = 0 // infinite
    public static readonly RABBITMQ_CON_RETRY_INTERVAL: number = 1000 // 1s

    // Log
    public static readonly LOG_DIR: string = 'logs'
}
