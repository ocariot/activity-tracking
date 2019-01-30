import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IActivityService } from '../port/activity.service.interface'
import { IActivityRepository } from '../port/activity.repository.interface'
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
     * @param {PhysicalActivity} activity
     * @returns {(Promise<PhysicalActivity>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing activity.
     */
    public async add(activity: PhysicalActivity): Promise<PhysicalActivity> {
        CreatePhysicalActivityValidator.validate(activity)
        const activityExist = await this._activityRepository.checkExist(activity)
        if (activityExist) throw new ConflictException('PhysicalActivity is already registered...')

        try {
            const activitySaved: PhysicalActivity = await this._activityRepository.create(activity)

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
     * @param idActivity PhysicalActivity ID.
     * @param idUser Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    public getByIdAndUser(idActivity: string, idUser: string, query: IQuery): Promise<PhysicalActivity> {
        query.filters = { _id: idActivity, child: idUser }
        return this._activityRepository.findOne(query)
    }

    /**
     * List the activities of a child.
     *
     * @param idUser Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByUser(idUser: string, query: IQuery): Promise<Array<PhysicalActivity>> {
        query.filters = Object.assign({ child: idUser }, query.filters)
        return this._activityRepository.find(query)
    }

    /**
     * Update child activity data.
     *
     * @param activity Containing the data to be updated
     * @param idUser Child ID.
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByUser(activity: PhysicalActivity, idUser: string): Promise<PhysicalActivity> {
        return this._activityRepository.updateByChild(activity, idUser)
    }

    /**
     * Removes activity according to its unique identifier and related child.
     *
     * @param idActivity Unique identifier.
     * @param idUser Child ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByUser(idActivity: string | number, idUser: string): Promise<boolean> {
        return this._activityRepository.removeByChild(idActivity, idUser)
    }

    public async update(activity: PhysicalActivity): Promise<PhysicalActivity> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
