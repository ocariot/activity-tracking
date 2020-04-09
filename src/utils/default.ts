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
    public static readonly APP_ID: string = 'activity.app'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 4000
    public static readonly PORT_HTTPS: number = 4001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/nutes.ocariot/tracking-service/v1/swagger.json'
    public static readonly LOGO_URI: string = 'http://www.ocariot.com.br/wp-content/uploads/2018/08/cropped-512-32x32.png'

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://127.0.0.1:27017/ocariot-activity-tracking'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://127.0.0.1:27017/ocariot-activity-tracking-test'

    // RabbitMQ
    public static readonly RABBITMQ_URI: string = 'amqp://guest:guest@127.0.0.1:5672'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // Certificate
    // To generate self-signed certificates, see: https://devcenter.heroku.com/articles/ssl-certificate-self
    public static readonly SSL_KEY_PATH: string = '.certs/server.key'
    public static readonly SSL_CERT_PATH: string = '.certs/server.crt'
    public static readonly RABBITMQ_CA_PATH: string = '.certs/ca.crt'

    /**
     * The frequency of time that the application will check, in the background, the need to send one or more
     * notifications, according to the cron expression.
     * For example, the value 0 0 9 * * *, means that the check it will occurs every day at 09:00:00.
     *
     * Cron ranges:
     *
     * Seconds            Minutes            Hours            Day of Month            Months            Day of Week
     *  0-59               0-59               0-23                1-31            0-11 (Jan-Dec)       0-6 (Sun-Sat)
     */
    public static readonly EXPRESSION_AUTO_NOTIFICATION: string = '0,10,20,30,40,50 * * * * *'

    // The number of days to be used as a parameter for checking the need to send one or more notifications.
    public static readonly NUMBER_OF_DAYS: number = 7
}
