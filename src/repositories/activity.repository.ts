import { IActivity } from '../models/activity'
import { ApiException, IExceptionError } from './../exceptions/api.exception'
import { IRepository } from './repository.interface'
import { resolve, resolveSoa } from 'dns'

/**
 * Class to manipulate the data of the Activity entity.
 *
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 */
export class ActivityRepository implements IRepository<IActivity> {

    // Model of device can be any.
    ActivityModel: any

    removeFields: Object

    /**
     * Constructor.
     * 
     * @param model
     */
    constructor(model: any) {
        this.ActivityModel = model
        this.removeFields = { __v: false, updated_at: false }
    }


    /**
     * Save new activity.
     * @param item - Object to be saved.
     * @returns - The saved activity.
     */
    save(item: IActivity): Promise<IActivity> {
        return new Promise((resolve, reject) => {
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
     * @param userId 
     * @param param2 
     * @param querys 
     * @returns - A list of activities.
     */
    getAll(userId?: string | undefined, param2?: string | undefined, querys?: any): Promise<IActivity[]> {
        let filter: any = !userId ? {} : { user_id: userId }
        
        return new Promise((resolve, reject) => {
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
     * @param activityId 
     * @param userId 
     * @param querys 
     * @returns - The requested activity. 
     */
    getById(activityId: string, userId?: string | undefined, querys?: any): Promise<IActivity> {
        let filter: any = !userId ? { _id: activityId } : { _id: activityId, user_id: userId }

        return new Promise((resolve, reject) => {
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
     * @returns - The updated activity.
     */
    update(item: IActivity): Promise<IActivity> {
        return new Promise((resolve, reject) => {
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
     * @param id - Id of the activity to be deleted.
     * @returns - True, if the activity will be deleted.
     */
    delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
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