import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { IEntityMapper } from '../entity/mapper/entity.mapper.interface'
import { Query } from './query/query'
import { IEventBus } from '../port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { Environment } from '../../application/domain/model/environment'
import { EnvironmentEntity } from '../entity/environment.entity'
import { EnvironmentSaveEvent } from '../../application/integration-event/event/environment.save.event'

/**
 * Implementation of the environment repository.
 *
 * @implements {IEnvironmentRepository}
 */
@injectable()
export class EnvironmentRepository extends BaseRepository<Environment, EnvironmentEntity> implements IEnvironmentRepository {
    constructor(
        @inject(Identifier.ENVIRONMENT_REPO_MODEL) readonly environmentModel: any,
        @inject(Identifier.ENVIRONMENT_ENTITY_MAPPER) readonly environmentMapper: IEntityMapper<Environment, EnvironmentEntity>,
        @inject(Identifier.RABBITMQ_EVENT_BUS) readonly rabbitMQEventBus: IEventBus,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(environmentModel, environmentMapper, logger)
    }

    /**
     * Add a new environment.
     * The saved environment is published on the event bus.
     *
     * @param environment Environment to insert.
     * @return {Promise<T>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     * @override
     */
    public create(environment: Environment): Promise<Environment> {
        const itemNew: EnvironmentEntity = this.mapper.transform(environment)
        return new Promise<Environment>((resolve, reject) => {
            this.Model.create(itemNew)
                .then((result: EnvironmentEntity) => {
                    const environmentResult: Environment = this.mapper.transform(result)
                    resolve(environmentResult)

                    this.logger.info('Publish measurement of environment on event bus...')
                    this.rabbitMQEventBus.publish(
                        new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date(), environmentResult),
                        'environments.save'
                    )
                })
                .catch(err => {
                    this.logger.debug('error ' + err.message)
                    reject(this.mongoDBErrorListener(err))
                })
        })
    }

    /**
     * Checks if an environment already has a registration.
     * What differs from one environment to another is the start date and associated user.
     *
     * @param environment
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(environment: Environment): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (environment.getTimestamp() && environment.getLocation()) {
                query.filters = { timestamp: environment.getTimestamp(), location: environment.getLocation() }
            }
            super.findOne(query)
                .then((result: Environment) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
