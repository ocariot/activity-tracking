import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IQuery } from '../../application/port/query.interface'
import { Fat } from '../../application/domain/model/fat'
import { FatEntity } from '../entity/fat.entity'
import { IFatRepository } from '../../application/port/fat.repository.interface'

/**
 * Implementation of the fat repository.
 *
 * @implements {IFatRepository}
 */
@injectable()
export class FatRepository extends BaseRepository<Fat, FatEntity> implements IFatRepository {
    constructor(
        @inject(Identifier.MEASUREMENT_REPO_MODEL) readonly measurementModel: any,
        @inject(Identifier.FAT_ENTITY_MAPPER) readonly fatMapper: IEntityMapper<Fat, FatEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(measurementModel, fatMapper, logger)
    }

    /**
     * Checks if a Fat already has a registration.
     * What differs from one Fat to another is the start date and associated child.
     *
     * @param fat
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(fat: Fat): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (fat.timestamp && fat.child_id && fat.type) {
                query.filters = { timestamp: fat.timestamp, child_id: fat.child_id, type: fat.type }
            }
            super.findOne(query)
                .then((result: Fat) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes Fat according to its unique identifier and related child.
     *
     * @param fatId Fat unique identifier.
     * @param childId Child unique identifier.
     * @param measurementType Type of Measurement.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(fatId: string, childId: string, measurementType: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ child_id: childId, _id: fatId, type: measurementType })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all Fat objects associated with the childId received.
     *
     * @param childId Child id associated with Fat objects.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllFatFromChild(childId: string): Promise<boolean> {
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
