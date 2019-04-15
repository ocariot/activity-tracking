import HttpStatus from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IPhysicalActivityService } from '../port/physical.activity.service.interface'
import { IPhysicalActivityRepository } from '../port/physical.activity.repository.interface'
import { PhysicalActivity } from '../domain/model/physical.activity'
import { CreatePhysicalActivityValidator } from '../domain/validator/create.physical.activity.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { PhysicalActivityEvent } from '../integration-event/event/physical.activity.event'
import { ILogger } from '../../utils/custom.logger'
import { UpdatePhysicalActivityValidator } from '../domain/validator/update.physical.activity.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { Strings } from '../../utils/strings'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'
import { MultiStatus } from '../domain/model/multi.status'
import { StatusSuccess } from '../domain/model/status.success'
import { StatusError } from '../domain/model/status.error'
import { ValidationException } from '../domain/exception/validation.exception'

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
     * Adds a new PhysicalActivity or a list of PhysicalActivity.
     *
     * @param {PhysicalActivity | Array<PhysicalActivity>} activity
     * @returns {(Promise<PhysicalActivity | MultiStatus<PhysicalActivity>)}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public async add(activity: PhysicalActivity | Array<PhysicalActivity>): Promise<PhysicalActivity | MultiStatus<PhysicalActivity>> {
        try {
            // Multiple items of PhysicalActivity
            if (activity instanceof Array) {
                return await this.addMultipleActivities(activity)
            }

            // Only one item
            return await this.addActivity(activity)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Adds the data of multiple items of PhysicalActivity.
     * Before adding, it is checked whether each of the activities already exists.
     *
     * @param activity
     * @return {Promise<MultiStatus<PhysicalActivity>>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addMultipleActivities(activity: Array<PhysicalActivity>): Promise<MultiStatus<PhysicalActivity>> {
        const multiStatus: MultiStatus<PhysicalActivity> = new MultiStatus<PhysicalActivity>()
        const statusSuccessArr: Array<StatusSuccess<PhysicalActivity>> = new Array<StatusSuccess<PhysicalActivity>>()
        const statusErrorArr: Array<StatusError<PhysicalActivity>> = new Array<StatusError<PhysicalActivity>>()

        for (const elem of activity) {
            try {
                // 1. Validate the object.
                CreatePhysicalActivityValidator.validate(elem)

                // 2. Checks if physical activity already exists.
                const activityExist = await this._activityRepository.checkExist(elem)
                if (activityExist) throw new ConflictException('Physical Activity is already registered...')

                // 3. Create new physical activity register.
                const activityItemSaved: PhysicalActivity = await this._activityRepository.create(elem)

                // 4. If created successfully, the object is published on the message bus.
                if (activityItemSaved) {
                    const event: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivitySaveEvent',
                        new Date(), activityItemSaved)
                    if (!(await this._eventBus.publish(event, 'activities.save'))) {
                        // 5. Save Event for submission attempt later when there is connection to message channel.
                        this.saveEvent(event)
                    } else {
                        this._logger.info(`Physical Activity with ID: ${activityItemSaved.id} published on event bus...`)
                    }
                }

                // 6a. Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<PhysicalActivity> = new StatusSuccess<PhysicalActivity>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 6b. Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<PhysicalActivity> = new StatusError<PhysicalActivity>(statusCode, err.message,
                    err.description, elem)
                statusErrorArr.push(statusError)
            }
        }

        // 7. Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        // 8. Returns the created MultiStatus object.
        return Promise.resolve(multiStatus)
    }

    /**
     * Adds the data of one item of PhysicalActivity.
     * Before adding, it is checked whether the activity already exists.
     *
     * @param activity PhysicalActivity
     * @return {Promise<Activity>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    private async addActivity(activity: PhysicalActivity): Promise<PhysicalActivity> {
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
                const event: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivitySaveEvent',
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
    public async updateByChild(activity: PhysicalActivity): Promise<PhysicalActivity> {
        try {
            // 1. Validate the object.
            UpdatePhysicalActivityValidator.validate(activity)

            // 2. Update the activity and save it in a variable.
            const activityUpdated: PhysicalActivity = await this._activityRepository.updateByChild(activity)

            // 3. If updated successfully, the object is published on the message bus.
            if (activityUpdated) {
                const event: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivityUpdateEvent',
                    new Date(), activityUpdated)
                if (!(await this._eventBus.publish(event, 'activities.update'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Physical Activity with ID: ${activityUpdated.id} was updated...`)
                }
            }
            // 5. Returns the updated object.
            return Promise.resolve(activityUpdated)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Removes physicalactivity according to its unique identifier and related child.
     *
     * @param activityId Unique identifier.
     * @param childId Child ID.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public async removeByChild(activityId: string, childId: string): Promise<boolean> {
        try {
            // 1. Validate id's
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(activityId, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Create a PhysicalActivity with only two attributes, the id and child_id, to be used in publishing on the event bus
            const activityToBeDeleted: PhysicalActivity = new PhysicalActivity()
            activityToBeDeleted.id = activityId

            const wasDeleted: boolean = await this._activityRepository.removeByChild(activityId, childId)

            // 3. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivityDeleteEvent',
                    new Date(), activityToBeDeleted)
                if (!(await this._eventBus.publish(event, 'activities.delete'))) {
                    // 4. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Physical Activity with ID: ${activityToBeDeleted.id} was deleted...`)
                }

                // 5a. Returns true
                return Promise.resolve(true)
            }

            // 5b. Returns false
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
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
    private saveEvent(event: IntegrationEvent<PhysicalActivity>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'PhysicalActivitySaveEvent') saveEvent.__routing_key = 'activities.save'
        if (event.event_name === 'PhysicalActivityDeleteEvent') saveEvent.__routing_key = 'activities.delete'
        if (event.event_name === 'PhysicalActivityUpdateEvent') saveEvent.__routing_key = 'activities.update'
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
