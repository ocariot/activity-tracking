import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEnvironmentRepository } from '../../application/port/environment.repository.interface'
import { Environment } from '../../application/domain/model/environment'
import { EnvironmentEntity } from '../entity/environment.entity'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IQuery } from '../../application/port/query.interface'

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
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(environmentModel, environmentMapper, logger)
    }

    /**
     * Checks if an environment already has a registration.
     * What differs from one environment to another is the start date and associated child.
     *
     * @param environment
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(environment: Environment): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (environment.timestamp && environment.location) {
                query.filters = {
                    'timestamp': environment.timestamp,
                    'location.local': environment.location.local,
                    'location.room': environment.location.room,
                    'location.latitude': environment.location.latitude,
                    'location.longitude': environment.location.longitude
                }
            }
            super.findOne(query)
                .then((result: Environment) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all environments associated with the institutionID received.
     *
     * @param institutionID Institution id associated with environments.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllEnvironmentsFromInstitution(institutionID: string): Promise<boolean> {
        // Creates the query with the received parameter
        const query: IQuery = new Query()
        query.filters = { institution_id: institutionID }

        return new Promise<boolean>((resolve, reject) => {
            this.Model.deleteMany(query.filters)
                .then(result => {
                    if (!result) return resolve(false)
                    return resolve(true)
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
