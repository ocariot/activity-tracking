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
            if (environment.institution_id && environment.timestamp && environment.location) {
                query.filters = {
                    'institution_id': environment.institution_id,
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
                .catch(err => reject(err))
        })
    }

    /**
     * Removes environment according to its unique identifier and related institution.
     *
     * @param environmentId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByInstitution(environmentId: string, institutionId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.environmentModel.findOneAndDelete({ institution_id: institutionId, _id: environmentId })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all environments associated with an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllByInstitution(institutionId: string): Promise<boolean> {
        // Creates the query with the received parameter
        const query: IQuery = new Query()
        query.filters = { institution_id: institutionId }

        return new Promise<boolean>((resolve, reject) => {
            this.environmentModel.deleteMany(query.filters)
                .then(result => {
                    if (!result) return resolve(false)
                    return resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Returns the total of environments of an Institution.
     *
     * @param institutionId Institution id associated with environments.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    public countByInstitution(institutionId: string): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { institution_id: institutionId } }))
    }

    /**
     * Returns the total of environments in a range of days (up to N days ago).
     *
     * @param numberOfDays Number of days used to search for environments in a range of days (up to {numberOfDays} ago).
     * @return {Promise<Array<Environment>>}
     * @throws {RepositoryException}
     */
    public findByTimestamp(numberOfDays: number): Promise<Array<Environment>> {
        // Sets the date object to be used in the search
        const searchDate: Date = new Date()
        searchDate.setDate(searchDate.getDate() - numberOfDays)

        // Sets the date in string format
        const searchDateStr: string = new Date(searchDate.getTime() - (searchDate.getTimezoneOffset() * 60000)).toISOString()

        // Sets the query and search
        const query: IQuery = new Query()
        query.filters = { 'timestamp': { $lt: searchDateStr } }

        return super.find(query)
    }
}
