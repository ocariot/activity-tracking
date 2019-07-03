import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IQuery } from '../../application/port/query.interface'
import { Weight } from '../../application/domain/model/weight'
import { WeightEntity } from '../entity/weight.entity'
import { IWeightRepository } from '../../application/port/weight.repository.interface'

/**
 * Implementation of the weight repository.
 *
 * @implements {IWeightRepository}
 */
@injectable()
export class WeightRepository extends BaseRepository<Weight, WeightEntity> implements IWeightRepository {
    constructor(
        @inject(Identifier.MEASUREMENT_REPO_MODEL) readonly measurementModel: any,
        @inject(Identifier.WEIGHT_ENTITY_MAPPER) readonly weightMapper: IEntityMapper<Weight, WeightEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(measurementModel, weightMapper, logger)
    }

    /**
     * Checks if a Weight already has a registration.
     * What differs from one Weight to another is the start date and associated child.
     *
     * @param weight
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(weight: Weight): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (weight.timestamp && weight.child_id && weight.type) {
                query.filters = { timestamp: weight.timestamp, child_id: weight.child_id, type: weight.type }
            }
            super.findOne(query)
                .then((result: Weight) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes Weight according to its unique identifier and related child.
     *
     * @param weightId Weight unique identifier.
     * @param childId Child unique identifier.
     * @param measurementType Type of Measurement.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(weightId: string, childId: string, measurementType: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ child_id: childId, _id: weightId, type: measurementType })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all Weight objects associated with the childId received.
     *
     * @param childId Child id associated with Weight objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllWeightFromChild(childId: string): Promise<boolean> {
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
