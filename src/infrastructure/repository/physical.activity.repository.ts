import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IPhysicalActivityRepository } from '../../application/port/physical.activity.repository.interface'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IQuery } from '../../application/port/query.interface'
import { PhysicalActivityEntity } from '../entity/physical.activity.entity'

/**
 * Implementation of the physicalactivity repository.
 *
 * @implements {IPhysicalActivityRepository}
 */
@injectable()
export class PhysicalActivityRepository extends BaseRepository<PhysicalActivity, PhysicalActivityEntity>
    implements IPhysicalActivityRepository {
    constructor(
        @inject(Identifier.ACTIVITY_REPO_MODEL) readonly activityModel: any,
        @inject(Identifier.ACTIVITY_ENTITY_MAPPER) readonly activityMapper: IEntityMapper<PhysicalActivity, PhysicalActivityEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(activityModel, activityMapper, logger)
    }

    /**
     * Checks if a physicalactivity already has a registration.
     * What differs from one physicalactivity to another is the start date and associated child.
     *
     * @param activity
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    public async checkExist(activity: PhysicalActivity): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (activity.start_time && activity.child_id) {
                query.filters = { start_time: activity.start_time, child_id: activity.child_id }
            }
            super.findOne(query)
                .then((result: PhysicalActivity) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(err))
        })
    }

    /**
     * Update child physicalactivity data.
     *
     * @param activity Containing the data to be updated
     * @return {Promise<T>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(activity: PhysicalActivity): Promise<PhysicalActivity> {
        const itemUp: PhysicalActivityEntity = this.activityMapper.transform(activity)
        return new Promise<PhysicalActivity>((resolve, reject) => {
            this.activityModel.findOneAndUpdate({
                    child_id: itemUp.child_id,
                    _id: itemUp.id
                },
                itemUp, { new: true })
                .exec()
                .then(result => {
                    if (!result) return resolve(undefined)
                    return resolve(this.activityMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes physicalactivity according to its unique identifier and related child.
     *
     * @param activityId Unique identifier.
     * @param childId Child ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(activityId: string | number, childId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.activityModel.findOneAndDelete({ child_id: childId, _id: activityId })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    /**
     * Removes all physical activities associated with the childId received.
     *
     * @param childId Child id associated with physical activities.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeAllActivitiesFromChild(childId: string): Promise<boolean> {
        // Creates the query with the received parameter
        const query: IQuery = new Query()
        query.filters = { child_id: childId }

        return new Promise<boolean>((resolve, reject) => {
            this.activityModel.deleteMany(query.filters)
                .then(result => {
                    if (!result) return resolve(false)
                    return resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public countActivities(childId: string): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { child_id: childId } }))
    }
}
