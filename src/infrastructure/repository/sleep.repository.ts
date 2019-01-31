import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { ISleepRepository } from '../../application/port/sleep.repository.interface'
import { Sleep } from '../../application/domain/model/sleep'
import { SleepEntity } from '../entity/sleep.entity'
import { IEntityMapper } from '../port/entity.mapper.interface'

/**
 * Implementation of the sleep repository.
 *
 * @implements {ISleepRepository}
 */
@injectable()
export class SleepRepository extends BaseRepository<Sleep, SleepEntity> implements ISleepRepository {
    constructor(
        @inject(Identifier.SLEEP_REPO_MODEL) readonly sleepModel: any,
        @inject(Identifier.SLEEP_ENTITY_MAPPER) readonly sleepMapper: IEntityMapper<Sleep, SleepEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(sleepModel, sleepMapper, logger)
    }

    /**
     * Checks if an sleep already has a registration.
     * What differs from one sleep to another is the start date and associated child.
     *
     * @param sleep
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(sleep: Sleep): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (sleep.start_time && sleep.child_id) {
                query.filters = { start_time: sleep.start_time, child_id: sleep.child_id }
            }
            super.findOne(query)
                .then((result: Sleep) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Update child sleep data.
     *
     * @param sleep Containing the data to be updated
     * @param childId Child unique identifier.
     * @return {Promise<T>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(sleep: Sleep, childId: string): Promise<Sleep> {
        const itemUp: SleepEntity = this.sleepMapper.transform(sleep)
        return new Promise<Sleep>((resolve, reject) => {
            this.Model.findOneAndUpdate({ child_id: childId, _id: itemUp.id }, itemUp, { new: true })
                .exec()
                .then(result => {
                    if (!result) return resolve(undefined)
                    return resolve(this.sleepMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes sleep according to its unique identifier and related child.
     *
     * @param sleepId Unique identifier.
     * @param childId Child unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(sleepId: string | number, childId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ child_id: childId, _id: sleepId })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
