import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IPhysicalActivityService } from '../port/physical.activity.service.interface'
import { IPhysicalActivityRepository } from '../port/physical.activity.repository.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'
import { CreatePhysicalActivityValidator } from '../domain/validator/create.physical.activity.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ActivitySaveEvent } from '../integration-event/event/activity.save.event'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing activity Service.
 *
 * @implements {IPhysicalActivityService}
 */
@injectable()
export class ActivityService implements IPhysicalActivityService {

    constructor(@inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly eventBus: IEventBus,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    /**
     * Adds a new activity.
     * Before adding, it is checked whether the activity already exists.
     *
     * @param {PhysicalActivity} activity
     * @returns {(Promise<PhysicalActivity>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing activity.
     */
    public async add(activity: PhysicalActivity): Promise<PhysicalActivity> {
        CreatePhysicalActivityValidator.validate(activity)

        try {
            const activityExist = await this._activityRepository.checkExist(activity)
            if (activityExist) throw new ConflictException('Physical Activity is already registered...')

            const activitySaved: PhysicalActivity = await this._activityRepository.create(activity)

            this.logger.info(`Physical Activity with ID: ${activitySaved.id} published on event bus...`)
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
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<PhysicalActivity>> {
        return this._activityRepository.find(query)
    }

    /**
     * Get in infrastructure the activity data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<PhysicalActivity> {
        query.filters = { _id: id }
        return this._activityRepository.findOne(query)
    }

    /**
     * Retrieve activity by unique identifier (ID) and child ID.
     *
     * @param activityId PhysicalActivity ID.
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(activityId: string, childId: string, query: IQuery): Promise<PhysicalActivity> {
        query.filters = { _id: activityId, child_id: childId }
        return this._activityRepository.findOne(query)
    }

    /**
     * List the activities of a child.
     *
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}`
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByChild(childId: string, query: IQuery): Promise<Array<PhysicalActivity>> {
        query.addFilter({ child_id: childId })
        return this._activityRepository.find(query)
    }

    /**
     * Update child activity data.
     *
     * @param activity Containing the data to be updated
     * @param childId Child ID.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(activity: PhysicalActivity, childId: string): Promise<PhysicalActivity> {
        return this._activityRepository.updateByChild(activity, childId)
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
        return this._activityRepository.removeByChild(activityId, childId)
    }

    public async update(physicalActivity: PhysicalActivity): Promise<PhysicalActivity> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
