import { IActivity } from '../models/activity'
import { ApiException, IExceptionError } from './../exceptions/api.exception'
import { IRepository } from './repository.interface'
import { Validator } from './../utils/validator'
import { resolve, resolveSoa } from 'dns'

/**
 * Class to manipulate the data of the Activity entity.
 *
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 */
export class ActivityRepository implements IRepository<IActivity> {

    /** 
     * Model of device can be any.
     * 
     */
    ActivityModel: any

    removeFields: Object

    /**
     * Constructor method. This method receives a parameter of type ActivityModel,
     * used to use the Mongoose methods to data manipulate in database.
     * 
     * @param model
     */
    constructor(model: any) {
        this.ActivityModel = model
        this.removeFields = { __v: false, updated_at: false }
    }


    /**
     * Save new activity.
     * 
     * @param item Object to be saved.
     * @returns Case the save is successful, it will resolve the saved activity.  
     * If there is an error during the save process, it will reject an error with
     * code and description, following the implementation pattern.
     */
    save(item: IActivity): Promise<IActivity> {
        return new Promise((resolve, reject) => {
            if(!Validator.validateObjectId(item.user_id)) 
                return reject(new ApiException(400, "Invalid parameter!", "Id of user is invalid!"))
            this.ActivityModel.create(item)
                .then((activity: IActivity) => activity)
                .then((activity) => {
                    resolve(activity)
                }).catch((err: any) => {
                    if (err.name == 'ValidationError')
                        return reject(new ApiException(400, 'Required fields were not included!', err.message))
                    else if (err.code === 11000)
                        return reject(new ApiException(409, 'Duplicate data is not allowed!'))
                    reject(new ApiException(500, err.toJson()))
                })
        })
    }

    /**
     * Get all activity associated with an user.
     * 
     * There are two situations where this method can be used.
     * -> The first situation refers to the consumption of all activities 
     *    saved in the database. In this case, the userId and deviceId 
     *    parameters will be null, and the search will be filtered based
     *    on the query string.
     * 
     * -> The second situation refers to the consumption of all activities 
     *    associated with an user. In this case, the userId parameter should 
     *    be non-null, and the search will be filtered based on this parameter
     *    and the query string.
     * 
     * @param userId Optional - The user id associated with the activities
     * @param param2 Parameter not used in this implementation
     * @param querys Parameter not used in this implementation
     * @returns Case the get is successful, it will resolve a list of activities 
     * associated with a user. If there is an error during the get process, it 
     * will reject an error with code and description, following the implementation 
     * pattern.
     */
    getAll(userId?: string | undefined, param2?: string | undefined, querys?: any): Promise<IActivity[]> {
        let filter: any = !userId ? {} : { user_id: userId }
        return new Promise((resolve, reject) => {
            if(!Validator.validateObjectId(filter.user_id)) 
                return reject(new ApiException(400, "Invalid parameter!", "Id of user is invalid!"))
            this.ActivityModel.find(filter, this.removeFields)
                .then((activities: Array<IActivity>) => {
                    if (activities.length === 0) return reject(new ApiException(404, 'Activities not found!'))
                    resolve(activities)
                }).catch((err: any) => {
                    if (err.name === 'CastError') return reject(new ApiException(err.code, err.message))
                    reject(new ApiException(err.code, err.toJson()))
                })
        })
    }

    /**
     * Get a unique activity associated with an user.
     *
     * There are two situations where this method can be used.
     * 
     * -> The first situation refers to the consumption of an activity only 
     *    with its id as a parameter. In this case, the id of the user can 
     *    be null, and the search will be done only by the id of the activity, 
     *    which must be non-null.
     * 
     * -> The second situation refers to the consumption of an activity having 
     *    as parameters the id of the user and the id of the activity. In this 
     *    case, in addition to the id of the activity, the id of the user must 
     *    be non-null, and the search will be done based on the id of the user 
     *    and the id of the activity.
     * 
     * @param activityId Id of activity 
     * @param userId Optional - The user id associated with the activitiy
     * @param querys Parameter not used in this implementation
     * @returns Case the get is successful, it will resolve a unique activity 
     * associated with a user. If there is an error during the get process, it 
     * will reject an error with code and description, following the implementation 
     * pattern.
     */
    getById(activityId: string, userId?: string | undefined, querys?: any): Promise<IActivity> {
        let filter: any = !userId ? { _id: activityId } : { _id: activityId, user_id: userId }
        return new Promise((resolve, reject) => {
            if(!Validator.validateObjectId(filter.user_id)) 
                return reject(new ApiException(400, "Invalid parameter!", "Id of user is invalid!"))
            this.ActivityModel.findOne(filter)
                .then((activity: IActivity) => {
                    if (!activity) return reject(new ApiException(404, 'Activity not found!'))
                    resolve(activity);
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))
                    reject(new ApiException(err.code, err.toJson()))
                })
        })
    }

    /**
     * Update a activity's params.
     * 
     * @param item - A activity with params to update.
     * @returns Case the update is successful, it will resolve a updated activity.
     * If there is an error during the get process, it will reject an error with 
     * code and description, following the implementation pattern.
     */
    update(item: IActivity): Promise<IActivity> {
        return new Promise((resolve, reject) => {
            if(!Validator.validateObjectId(item.user_id)) 
                return reject(new ApiException(400, "Invalid parameter!", "Id of user is invalid!"))
            this.ActivityModel.findByIdAndUpdate(item._id, item, { new: true })
                .exec((err, activity) => {
                    if (err) {
                        if (err.code === 11000)
                            return reject(new ApiException(409, 'Duplicate data is not allowed!'))
                        else if (err.name == 'CastError')
                            return reject(new ApiException(400, 'Invalid parameter!', err.message))
                        return reject(new ApiException(500, err.message))
                    }
                    resolve(activity)
                })
        })
    }

    /**
     * Delete a activity.
     * 
     * @param id - Id of the activity to be deleted.
     * @returns Case the get is successful, it will resolve a true status. If there 
     * is an error during the get process, it will reject an error with code and 
     * description, following the implementation pattern.
     */
    delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if(!Validator.validateObjectId(id)) 
                return reject(new ApiException(400, "Invalid parameter!", "Id of user is invalid!"))
            this.ActivityModel.findByIdAndDelete({ _id: id })
                .exec((err) => {
                    if (err) {
                        if (err.name == 'CastError')
                            return reject(new ApiException(400, 'Invalid parameter!', err.message))
                        return reject(new ApiException(500, err.toJson()))
                    }
                    resolve(true)
                })
        })
    }
}