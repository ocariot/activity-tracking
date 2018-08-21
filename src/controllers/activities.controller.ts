import { Request, Response } from 'express'
import { Activity } from '../models/activity'
import { ActivityRepository } from '../repositories/activity.repository'
import { IActivity } from '../models/activity'
import { IExceptionError, ApiException } from './../exceptions/api.exception'
import { Validator } from '../utils/validator'

/**
 * Controller that implements Activity feature operations.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export class ActivityController {

    /**
     * Variable used to gain access to repository methods.
     */
    repository: ActivityRepository

    /**
     * Constructor method. This method receives a parameter of type ActivityModel,
     * used to set the value of the repository property.
     * @param ActivityModel 
     */
    constructor(ActivityModel: any) {
        this.repository = new ActivityRepository(ActivityModel)
    }


    /**
     * Get all activities associated with an user.
     * 
     * @param req  Object that contains information about the HTTP request to 
     * get all the activities associated with a user. Should contains the id 
     * of user in the params.
     * @param res  HTTP response. If the request is successful, the server
     * will send a list with the objects that were requested, and return 
     * status 200. If there is a validation error of the user ID in the request 
     * or error during the database search process, the system will return the 
     * error status and description, following the implementation pattern.
     * @returns In this implementation, the response to server is sended by the 
     * param 'res'.
     */
    getAllActivities(req: Request, res: Response): any {
        if (!Validator.validateUserId(req.params.user_id)) {
            let err = new ApiException(400, "Invalid parameter!", "Id of user is invalid!")
            return res.status(err.code).send(err.toJson())
        }

        return this.repository.getAll(req.params.user_id)
            .then((activities: Array<IActivity>) => {
                for (var i = 0; i < activities.length; i++) {
                    activities[i] = activities[i].toJSON()
                    delete activities[i].user_id
                }
                res.status(200).send(activities)
            }).catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
    * Save a activity and associates it with a user.
    * 
    * @param req Object that contains information about the HTTP request to save
    * an activity and associates it with a user. Should contains the id of user 
    * in the params and the activity in the body request.
    * @param res HTTP response. If the request is successful, the server will send
    * the saved activity object, and the returns status 201. If there is a validation
    * error of the user ID in the request or error during the database save process, 
    * the system will return the error status and description, following the 
    * implementation pattern.
    * @returns In this implementation, the response to server is sended by the param 
    * 'res'.
    */
    saveActivity(req: Request, res: Response): any {
        if (!Validator.validateUserId(req.params.user_id)) {
            let err = new ApiException(400, "Invalid parameter!", "Id of user is invalid!")
            return res.status(err.code).send(err.toJson())
        }
        req.body.user_id = req.params.user_id
        return this.repository.save(new Activity(req.body))
            .then((activity: IActivity) => {
                activity = activity.toJSON()
                delete activity.user_id
                return res.status(201).send(activity)
            }).catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
    * Get a unique activity associated with an user.
    * 
    * @param req Object that contains information about the HTTP request to get a 
    * unique activity associated with an user. Should contains the id of user  and
    * the id of requested activity in the params.
    * @param res HTTP response. If the request is successful, the server will send
    * the request activity object, and the returns status 200. If there is a 
    * validation error of the user ID in the request or error during the database
    * search process, the system will return the error status and description, ,
    * following the implementation pattern.
    * @returns In this implementation, the response to server is sended by the param
    * 'res'.
    */
    getActivitiyById(req: Request, res: Response): any {
        if (!Validator.validateUserId(req.params.user_id)) {
            let err = new ApiException(400, "Invalid parameter!", "Id of user is invalid!")
            return res.status(err.code).send(err.toJson())
        }

        return this.repository.getById(req.params.activity_id, req.params.user_id)
            .then((activity: IActivity) => {
                activity = activity.toJSON()
                delete activity.user_id
                return res.status(200).send(activity)
            }).catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
     * Delete a activity associated with an user.
     * 
     * @param req Object that contains information about the HTTP request to delete
     * a unique activity associated with an user. Should contains the id of user  and
     * the id of activity to be deleted in the params.
     * @param res HTTP response. If the request is successful, the server will send
     * a empty object, and the returns status 204. If there is a validation error of
     * the user ID in the request or error during the database delete process, the 
     * system will return the error status and description, following the 
     * implementation pattern.
     * @returns In this implementation, the response to server is sended by the param'res'.
     */
    deleteActivity(req: Request, res: Response): any {
        if (!Validator.validateUserId(req.params.user_id)) {
            let err = new ApiException(400, "Invalid parameter!", "Id of user is invalid!")
            return res.status(err.code).send(err.toJson())
        }

        return this.repository.delete(req.params.activity_id)
            .then((isDeleted: boolean) => {
                if (isDeleted) res.status(204).send()
            }).catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }
}
