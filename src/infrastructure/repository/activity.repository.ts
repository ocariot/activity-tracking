import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IActivityRepository } from '../../application/port/activity.repository.interface'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { ActivityEntity } from '../entity/activity.entity'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'

/**
 * Implementation of the activity repository.
 *
 * @implements {IActivityRepository}
 */
@injectable()
export class ActivityRepository extends BaseRepository<PhysicalActivity, ActivityEntity> implements IActivityRepository {
    constructor(
        @inject(Identifier.ACTIVITY_REPO_MODEL) readonly activityModel: any,
        @inject(Identifier.ACTIVITY_ENTITY_MAPPER) readonly activityMapper: IEntityMapper<PhysicalActivity, ActivityEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(activityModel, activityMapper, logger)
    }

    /**
     * Checks if an activity already has a registration.
     * What differs from one activity to another is the start date and associated child.
     *
     * @param activity
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(activity: PhysicalActivity): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (activity.start_time && activity.child_id) {
                query.filters = { start_time: activity.start_time, child: activity.child_id }
            }
            super.findOne(query)
                .then((result: PhysicalActivity) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Update child activity data.
     *
     * @param activity Containing the data to be updated
     * @param childId Child ID.
     * @return {Promise<T>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(activity: PhysicalActivity, childId: string): Promise<PhysicalActivity> {
        const itemUp: ActivityEntity = this.activityMapper.transform(activity)
        return new Promise<PhysicalActivity>((resolve, reject) => {
            this.Model.findOneAndUpdate({ child_id: childId, _id: itemUp.id }, itemUp, { new: true })
                .exec()
                .then(result => {
                    if (!result) return resolve(undefined)
                    return resolve(this.activityMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes activity according to its unique identifier and related child.
     *
     * @param activityId Unique identifier.
     * @param childId Child ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(activityId: string | number, childId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ child: childId, _id: activityId })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
