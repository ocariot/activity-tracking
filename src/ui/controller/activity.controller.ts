import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { IPhysicalActivityService } from '../../application/port/physical.activity.service.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Controller that implements PhysicalActivity feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/children')
export class ActivityController {

    /**
     * Creates an instance of PhysicalActivity controller.
     *
     * @param {IPhysicalActivityService} _activityService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_SERVICE) private readonly _activityService: IPhysicalActivityService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Retrieve physical physicalActivity list of all children.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/physicalactivities')
    public async getAllPhysicalActivities(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._activityService.getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Add new physical physicalActivity.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/physicalactivities')
    public async saveActivity(@request() req: Request, @response() res: Response) {
        try {
            const physicalActivity: PhysicalActivity = new PhysicalActivity().fromJSON(req.body)
            physicalActivity.child_id = req.params.child_id

            const result: PhysicalActivity = await this._activityService.add(physicalActivity)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Recovers physical activities of the child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/physicalactivities')
    public async getAllPhysicalActivitiesOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._activityService
                .getAllByChild(req.params.child_id, new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get physicalActivity by id and child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/physicalactivities/:physicalactivity_id')
    public async getPhysicalActivityById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: PhysicalActivity = await this._activityService
                .getByIdAndChild(req.params.physicalactivity_id, req.params.child_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update physical physicalActivity of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:child_id/physicalactivities/:physicalactivity_id')
    public async updatePhysicalActivityOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const physicalActivity: PhysicalActivity = new PhysicalActivity().fromJSON(req.body)
            physicalActivity.id = req.params.physicalactivity_id

            const result = await this._activityService.updateByChild(physicalActivity, req.params.child_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove physical physicalActivity of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/physicalactivities/:physicalactivity_id')
    public async deletePhysicalActivityOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._activityService.removeByChild(req.params.physicalactivity_id, req.params.child_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Recover the logs.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/physicalactivities/logs/date/:date_start/:date_end')
    public async getLogs(@request() req: Request, @response() res: Response): Promise<Response> {
        return res.status(HttpStatus.OK).send(
            '<div style="text-align: center;"><h1>Sorry :(<br>Feature not implemented.</h1>' +
            '<h2>Do not worry, it will be added soon... \\0/</h2></div>')
    }

    /**
     * Recover the logs.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/physicalactivities/logs/:reource/date/:date_start/:date_end')
    public async getLogByResource(@request() req: Request, @response() res: Response): Promise<Response> {
        return res.status(HttpStatus.OK).send(
            '<div style="text-align: center;"><h1>Sorry :(<br>Feature not implemented.</h1>' +
            '<h2>Do not worry, it will be added soon... \\0/</h2></div>')
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageNotActivityFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Physical Activity not found!',
            'Physical Activity not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
