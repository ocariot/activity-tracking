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
    repository: ActivityRepository

    constructor(ActivityModel: any) {
        this.repository = new ActivityRepository(ActivityModel)
    }


    /**
     * Get all activities associated with an user.
     * 
     * @param req 
     * @param res 
     * @returns any
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
                res.send(activities)
            }).catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
    * Save a activity and associates it with a user.
    * 
    * @param req 
    * @param res 
    * @returns any
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
    * @param req 
    * @param res 
    * @returns any
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
     * @param req 
     * @param res 
     * @returns any
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
