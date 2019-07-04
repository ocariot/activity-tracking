import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IQuery } from '../../application/port/query.interface'
import { BodyFat } from '../../application/domain/model/body.fat'
import { BodyFatEntity } from '../entity/body.fat.entity'
import { IBodyFatRepository } from '../../application/port/body.fat.repository.interface'

/**
 * Implementation of the BodyFat repository.
 *
 * @implements {IBodyFatRepository}
 */
@injectable()
export class BodyFatRepository extends BaseRepository<BodyFat, BodyFatEntity> implements IBodyFatRepository {
    constructor(
        @inject(Identifier.MEASUREMENT_REPO_MODEL) readonly measurementModel: any,
        @inject(Identifier.BODY_FAT_ENTITY_MAPPER) readonly bodyFatMapper: IEntityMapper<BodyFat, BodyFatEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(measurementModel, bodyFatMapper, logger)
    }

    /**
     * Checks if a BodyFat already has a registration.
     * What differs from one BodyFat to another is the start date and associated child.
     *
     * @param bodyFat
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(bodyFat: BodyFat): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (bodyFat.timestamp && bodyFat.child_id && bodyFat.type) {
                query.filters = { timestamp: bodyFat.timestamp, child_id: bodyFat.child_id, type: bodyFat.type }
            }
            super.findOne(query)
                .then((result: BodyFat) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Retrieves a BodyFat according to the parameters.
     *
     * @param bodyFatTimestamp Timestamp associated with BodyFat.
     * @param childId Child unique identifier.
     * @param bodyFatType Type of the Measurement.
     * @return {Promise<BodyFat>}
     * @throws {ValidationException | RepositoryException}
     */
    public async customFindOne(bodyFatTimestamp: Date, childId: string, bodyFatType: string): Promise<BodyFat> {
        // Creates the query with the received parameters
        const query: IQuery = new Query()
        query.filters = {
            timestamp: bodyFatTimestamp,
            child_id: childId,
            type: bodyFatType
        }

        return new Promise<BodyFat>((resolve, reject) => {
            this.Model.findOne(query.filters)
                .select(query.fields)
                .exec()
                .then((result: BodyFat) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.bodyFatMapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes BodyFat according to its unique identifier and related child.
     *
     * @param bodyFatId BodyFat unique identifier.
     * @param childId Child unique identifier.
     * @param measurementType Type of Measurement.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(bodyFatId: string, childId: string, measurementType: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ child_id: childId, _id: bodyFatId, type: measurementType })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all BodyFat objects associated with the childId received.
     *
     * @param childId Child id associated with BodyFat objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllBodyFatFromChild(childId: string): Promise<boolean> {
        // Creates the query with the received parameter
        const query: IQuery = new Query()
        query.filters = { child_id: childId }

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
