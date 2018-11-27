import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IActivityService } from '../port/activity.service.interface'
import { IActivityRepository } from '../port/activity.repository.interface'
import { Activity } from '../domain/model/activity'
import { ActivityValidator } from '../domain/validator/activity.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ActivitySaveEvent } from '../integration-event/event/activity.save.event'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing activity Service.
 *
 * @implements {IActivityService}
 */
@injectable()
export class ActivityService implements IActivityService {

    constructor(@inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IActivityRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly eventBus: IEventBus,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    /**
     * Adds a new activity.
     * Before adding, it is checked whether the activity already exists.
     *
     * @param {Activity} activity
     * @returns {(Promise<Activity>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing activity.
     */
    public async add(activity: Activity): Promise<Activity> {
        ActivityValidator.validate(activity)
        const activityExist = await this._activityRepository.checkExist(activity)
        if (activityExist) throw new ConflictException('Activity is already registered...')

        try {
            const activitySaved: Activity = await this._activityRepository.create(activity)

            this.logger.info(`Activity with ID: ${activitySaved.getId()} published on event bus...`)
            this.eventBus.publish(
                new ActivitySaveEvent('ActivitySaveEvent', new Date(), activitySaved),
                'activities.save'
            )
            return Promise.resolve(activitySaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all activity in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Activity>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Activity>> {
        return this._activityRepository.find(query)
    }

    /**
     * Get in infrastructure the activity data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Activity>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<Activity> {
        query.filters = { _id: id }
        return this._activityRepository.findOne(query)
    }

    /**
     * Retrieve activity by unique identifier (ID) and user ID.
     *
     * @param idActivity Activity ID.
     * @param idUser User ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Activity>>}
     * @throws {RepositoryException}
     */
    public getByIdAndUser(idActivity: string, idUser: string, query: IQuery): Promise<Activity> {
        query.filters = { _id: idActivity, user: idUser }
        return this._activityRepository.findOne(query)
    }

    /**
     * List the activities of a user.
     *
     * @param idUser User ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Activity>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByUser(idUser: string, query: IQuery): Promise<Array<Activity>> {
        query.filters = Object.assign({ user: idUser }, query.filters)
        return this._activityRepository.find(query)
    }

    /**
     * Update user activity data.
     *
     * @param activity Containing the data to be updated
     * @param idUser User ID.
     * @return {Promise<Activity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByUser(activity: Activity, idUser: string): Promise<Activity> {
        return this._activityRepository.updateByUser(activity, idUser)
    }

    /**
     * Removes activity according to its unique identifier and related user.
     *
     * @param idActivity Unique identifier.
     * @param idUser User ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByUser(idActivity: string | number, idUser: string): Promise<boolean> {
        return this._activityRepository.removeByUser(idActivity, idUser)
    }

    public async update(activity: Activity): Promise<Activity> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
