import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ValidationException } from '../../domain/exception/validation.exception'
import { Environment } from '../../domain/model/environment'
import { IEnvironmentService } from '../../port/environment.service.interface'

/**
 * Handler for EnvironmentSaveEvent operation.
 *
 * @param event
 */
export const environmentSaveEventHandler = async (event: any) => {
    const environmentService: IEnvironmentService = DIContainer.get<IEnvironmentService>(Identifier.ENVIRONMENT_SERVICE)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.environment) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        if (event.environment instanceof Array) {
            // 1. Convert json environment array to object.
            const environmentsArr: Array<Environment> = event.environment.map(item => {
                const environmentItem: Environment = new Environment().fromJSON(item)
                environmentItem.isFromEventBus = true
                return environmentItem
            })

            // 2. Try to add environments
            environmentService.add(environmentsArr)
                .then(result => {
                    logger.info(`Action for event ${event.event_name} successfully held! Total successful items: `
                        .concat(`${result.success.length} / Total items with error: ${result.error.length}`))
                })
                .catch((err) => {
                    throw err
                })
        }
        else {
            // 1. Convert json environment to object.
            const environment: Environment = new Environment().fromJSON(event.environment)
            environment.isFromEventBus = true

            // 2. Try to add the environment
            await environmentService.add(environment)
            logger.info(`Action for event ${event.event_name} successfully held!`)
        }
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
