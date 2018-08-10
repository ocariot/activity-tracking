import { Router, Request, Response } from 'express'
import { IRouter } from './router.interface'
import config from '../../config/config'
import activityRouter from './activities.router'
import activitiesRouter from './activities.router'

/**
 * Class that defines the general routes of the API and redirects
 * for each Router to define its own routes.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
class IndexRouter implements IRouter<any> {
    router: Router

    constructor() {
        this.router = Router()
        this.initialize()
    }

    /**
     * Initialize routes
     */
    initialize(): void {
        // Readme
        this.router.get('/', (req: Request, res: Response) => res.send(this.readme()))
        this.router.get('/api/v1', (req: Request, res: Response) => res.send(this.readme()))

        // Resources Activities
        this.router.use('/api/v1/users/:user_id/activities', activitiesRouter)
    }

    /**
     * Returns the API presentation message.
     * 
     * @returns String
     */
    readme(): String {
        return config.README_DEFAULT
    }
}

export default new IndexRouter().router