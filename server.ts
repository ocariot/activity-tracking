import http from 'http'
import https from 'https'
import { Application } from 'express'
import { Identifier } from './src/di/identifiers'
import { DI } from './src/di/di'
import { ILogger } from './src/utils/custom.logger'
import { BackgroundService } from './src/background/background.service'
import { Default } from './src/utils/default'
import { App } from './src/app'
import { readFileSync } from 'fs'

/**
 * Used only in development or test to load environment variables.
 * NOTE:
 *  For the development and testing environment, create the .env file
 *  in the root directory of your project and add your environment variables
 *  to new lines in the format NAME=VALUE. For example:
 *      DB_HOST=localhost
 *      DB_USER=root
 *      DB_PASS=mypass
 *  The fastest way is to create a copy of the .env.example file.
 *
 *  NOTE: For the production environment it is highly recommended not to use .env.
 */
require(`dotenv`).load()

const logger: ILogger = DI.getInstance().getContainer().get<ILogger>(Identifier.LOGGER)
const app: Application = (DI.getInstance().getContainer().get<App>(Identifier.APP)).getExpress()
const backgroundServices: BackgroundService = DI.getInstance().getContainer().get(Identifier.BACKGROUND_SERVICE)
const port_http = process.env.PORT_HTTP || Default.PORT_HTTP
const port_https = process.env.PORT_HTTPS || Default.PORT_HTTPS
const https_options = {
    key: readFileSync(process.env.PRIVATE_KEY_CERT_PATH || Default.PRIVATE_KEY_CERT_PATH),
    cert: readFileSync(process.env.CERT_PATH || Default.CERT_PATH)
}

/**
 * Initializes HTTP server and redirects accesses to HTTPS.
 */
http.createServer((req, res) => {
    const host = req.headers.host || ''
    const newLocation = 'https://' + host.replace(/:\d+/, ':' + port_https) + req.url
    res.writeHead(301, { Location: newLocation })
    res.end()
}).listen(port_http)

/**
 * Initializes HTTPS server.
 * After the successful startup, listener is initialized
 * for important events and background services.
 */
https.createServer(https_options, app)
    .listen(port_https, () => {
        initListener()
        backgroundServices.startServices()
            .then(() => {
                logger.info('Initialized background services.')
            })
        logger.debug(`Server HTTPS running on port ${port_https}`)
    })

/**
 * Function to listen to the SIGINT event and end services
 * in the background, when the respective event is triggered.
 */
function initListener(): void {
    process.on('SIGINT', () => {
        backgroundServices.stopServices()
            .then(() => {
                logger.info('Stopped background services.')
            })
        process.exit()
    })
}
