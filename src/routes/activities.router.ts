import { Router, Request, Response } from 'express'
import { IRouter } from './router.interface'
import { ActivityController } from '../controllers/activities.controller'
import { Activity } from '../models/activity'

/**
 * Class that defines the routes of the User's Activities resource.
 *
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */

class ActivityRouter implements IRouter<ActivityController> {
    router: Router
    controller: ActivityController
    
    constructor() {
        this.router = Router()
        this.controller = new ActivityController(Activity)
        this.initialize()
    }

    /**
     * Initialize routes.
     * 
     * @returns Router
     */
    initialize(): Router {
        // api/v1/devices
        this.router.get('/', (req: Request, res: Response) => {
            req.params.user_id = req.baseUrl.split("/")[4]
            this.controller.getAllActivities(req, res)
        })

        this.router.post('/', (req: Request, res: Response) => {
            req.params.user_id = req.baseUrl.split("/")[4]
            this.controller.saveActivity(req, res)
        })

        this.router.get('/:activity_id', (req: Request, res: Response) => {
            req.params.user_id = req.baseUrl.split("/")[4]
            this.controller.getActivitiyById(req, res)
        })

        this.router.delete('/:activity_id', (req: Request, res: Response) => {
            req.params.user_id = req.baseUrl.split("/")[4]
            this.controller.deleteActivity(req, res)
        })

        return this.router
    }
}

export default new ActivityRouter().router