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
    public static readonly APP_ID: string = 'activity.app'
    public static readonly APP_DESCRIPTION: string = 'Micro-service for tracking physicalactivity, sleep and food.'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 3000
    public static readonly PORT_HTTPS: number = 3001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/nutes.ocariot/tracking-service/v1/swagger.json'
    public static readonly LOGO_URI: string = 'http://www.ocariot.com.br/wp-content/uploads/2018/08/cropped-512-32x32.png'

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://127.0.0.1:27017/tracking-service'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://127.0.0.1:27017/tracking-service-test'

    // RabbitMQ
    public static readonly RABBITMQ_HOST: string = '127.0.0.1:5672'
    public static readonly RABBITMQ_PORT: number = 5672
    public static readonly RABBITMQ_USERNAME: string = 'guest'
    public static readonly RABBITMQ_PASSWORD: string = 'guest'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // Certificate
    // To generate self-signed certificates, see: https://devcenter.heroku.com/articles/ssl-certificate-self
    public static readonly PRIVATE_KEY_CERT_PATH: string = 'certs/server.key'
    public static readonly CERT_PATH: string = 'certs/server.crt'

    public static readonly IP_WHITELIST: Array<string> = ['*']
}
