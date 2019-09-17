import qs from 'query-strings-parser'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IPhysicalActivityRepository } from '../../application/port/physical.activity.repository.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IQuery } from '../../application/port/query.interface'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { ISleepRepository } from '../../application/port/sleep.repository.interface'
import { IWeightRepository } from '../../application/port/weight.repository.interface'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { Weight } from '../../application/domain/model/weight'
import { Environment } from '../../application/domain/model/environment'
import { Log } from '../../application/domain/model/log'
import { ILogRepository } from '../../application/port/log.repository.interface'

@injectable()
export class ProviderEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
        @inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository,
        @inject(Identifier.WEIGHT_REPOSITORY) private readonly _weightRepository: IWeightRepository,
        @inject(Identifier.ENVIRONMENT_REPOSITORY) private readonly _environmentRepository: IEnvironmentRepository,
        @inject(Identifier.LOG_REPOSITORY) private readonly _logRepository: ILogRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeProviders()
    }

    public stop(): Promise<void> {
        return this._eventBus.dispose()
    }

    /**
     * Provide resources for queries.
     * Most queries support the query string pattern defined in the REST API.
     */
    private initializeProviders(): void {
        // Providing physical activity resource.
        this._eventBus.bus
            .providePhysicalActivities(async (query) => {
                const _query: IQuery = new Query().fromJSON({ ...qs.parser(query, {},
                                            { date_fields: { start_at: 'start_time', end_at: 'start_time'}}) })
                const result: Array<PhysicalActivity> = await this._activityRepository.find(_query)
                return result.map(item => item.toJSON())
            })
            .then(() => this._logger.info('PhysicalActivity resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide PhysicalActivity resource: ${err.message}`))

        // Providing sleep resource.
        this._eventBus.bus
            .provideSleep(async (query) => {
                const _query: IQuery = new Query().fromJSON({ ...qs.parser(query, {},
                        { date_fields: { start_at: 'start_time', end_at: 'start_time'}}) })
                const result: Array<Sleep> = await this._sleepRepository.find(_query)
                return result.map(item => item.toJSON())
            })
            .then(() => this._logger.info('Sleep resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Sleep resource: ${err.message}`))

        // Providing weight resource.
        this._eventBus.bus
            .provideWeights(async (query) => {
                const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                const result: Array<Weight> = await this._weightRepository.find(_query)
                return result.map(item => item.toJSON())
            })
            .then(() => this._logger.info('Weight resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Weight resource: ${err.message}`))

        // Providing environment resource.
        this._eventBus.bus
            .provideEnvironments(async (query) => {
                const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                const result: Array<Environment> = await this._environmentRepository.find(_query)
                return result.map(item => item.toJSON())
            })
            .then(() => this._logger.info('Environment resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Environment resource: ${err.message}`))

        // Providing logs resource.
        this._eventBus.bus
            .provideLogs(async (query) => {
                const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                const result: Array<Log> = await this._logRepository.find(_query)
                return result.map(item => item.toJSON())
            })
            .then(() => this._logger.info('Log resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Log resource: ${err.message}`))
    }
}
