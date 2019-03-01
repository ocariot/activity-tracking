import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IPhysicalActivityService } from '../port/physical.activity.service.interface'
import { IPhysicalActivityRepository } from '../port/physical.activity.repository.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'
import { CreatePhysicalActivityValidator } from '../domain/validator/create.physical.activity.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { PhysicalActivitySaveEvent } from '../integration-event/event/physical.activity.save.event'
import { ILogger } from '../../utils/custom.logger'
import { UpdatePhysicalActivityValidator } from '../domain/validator/update.physical.activity.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'

/**
 * Implementing physicalactivity Service.
 *
 * @implements {IPhysicalActivityService}
 */
@injectable()
export class PhysicalActivityService implements IPhysicalActivityService {

    constructor(@inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    /**
     * Adds a new physicalactivity.
     * Before adding, it is checked whether the physicalactivity already exists.
     *
     * @param {PhysicalActivity} activity
     * @returns {(Promise<PhysicalActivity>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing physicalactivity.
     */
    public async add(activity: PhysicalActivity): Promise<PhysicalActivity> {
        try {
            // 1. Validate the object.
            CreatePhysicalActivityValidator.validate(activity)

            // 2. Checks if physical activity already exists.
            const activityExist = await this._activityRepository.checkExist(activity)
            if (activityExist) throw new ConflictException('Physical Activity is already registered...')

            // 3. Create new physical activity register.
            const activitySaved: PhysicalActivity = await this._activityRepository.create(activity)

            // 4. If created successfully, the object is published on the message bus.
            if (activitySaved) {
                const event: PhysicalActivitySaveEvent = new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent',
                    new Date(), activitySaved)
                if (!(await this._eventBus.publish(event, 'activities.save'))) {
                    // 5. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Physical Activity with ID: ${activitySaved.id} published on event bus...`)
                }
            }
            // 6. Returns the created object.
            return Promise.resolve(activitySaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Get the data of all physicalactivity in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<PhysicalActivity>> {
        return this._activityRepository.find(query)
    }

    /**
     * Get in infrastructure the physicalactivity data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<PhysicalActivity>}
     * @throws {RepositoryException}
     */
    public async getById(id: string, query: IQuery): Promise<PhysicalActivity> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Retrieve physicalactivity by unique identifier (ID) and child ID.
     *
     * @param activityId PhysicalActivity ID.
     * @param childId Child ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<PhysicalActivity>>}
     * @throws {RepositoryException}
     */
    public getByIdAndChild(activityId: string, childId: string, query: IQuery): Promise<PhysicalActivity> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(activityId, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ _id: activityId, child_id: childId })
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
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        query.addFilter({ child_id: childId })
        return this._activityRepository.find(query)
    }

    /**
     * Update child physicalactivity data.
     *
     * @param activity Containing the data to be updated
     * @return {Promise<PhysicalActivity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByChild(activity: PhysicalActivity): Promise<PhysicalActivity> {
        UpdatePhysicalActivityValidator.validate(activity)
        return this._activityRepository.updateByChild(activity)
    }

    /**
     * Removes physicalactivity according to its unique identifier and related child.
     *
     * @param activityId Unique identifier.
     * @param childId Child ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByChild(activityId: string, childId: string): Promise<boolean> {
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(activityId, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)

        return this._activityRepository.removeByChild(activityId, childId)
    }

    public async update(physicalActivity: PhysicalActivity): Promise<PhysicalActivity> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: PhysicalActivitySaveEvent): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        saveEvent.__routing_key = 'activities.save'
        this._integrationEventRepository
            .create(JSON.parse(JSON.stringify(saveEvent)))
            .then(() => {
                this._logger.warn(`Could not publish the event named ${event.event_name}.`
                    .concat(` The event was saved in the database for a possible recovery.`))
            })
            .catch(err => {
                this._logger.error(`There was an error trying to save the name event: ${event.event_name}.`
                    .concat(`Error: ${err.message}. Event: ${JSON.stringify(saveEvent)}`))
            })
    }
}
