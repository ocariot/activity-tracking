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
import { ILogService } from '../../application/port/log.service.interface'
import { Log } from '../../application/domain/model/log'
import { PhysicalActivityLog } from '../../application/domain/model/physical.activity.log'
import { MultiStatus } from '../../application/domain/model/multi.status'

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
     * @param {ILogService} _activityLogService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.ACTIVITY_SERVICE) private readonly _activityService: IPhysicalActivityService,
        @inject(Identifier.ACTIVITY_LOG_SERVICE) private readonly _activityLogService: ILogService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Retrieve physical physicalactivity list of all children.
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
     * Add new physical physicalactivity.
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
     * Get physicalactivity by id and child.
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
     * Update physical physicalactivity of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:child_id/physicalactivities/:physicalactivity_id')
    public async updatePhysicalActivityOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const physicalActivity: PhysicalActivity = new PhysicalActivity().fromJSON(req.body)
            physicalActivity.id = req.params.physicalactivity_id
            physicalActivity.child_id = req.params.child_id

            const result = await this._activityService.updateByChild(physicalActivity)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove physical physical activity of the child.
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
     * Add new physical activity.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/physicalactivities/logs/:resource')
    public async saveLog(@request() req: Request, @response() res: Response) {
        try {

            const activityLogs: Array<Log> = []
            if (req.body instanceof Array) {
                req.body.forEach(item => {
                    const log: Log = new Log().fromJSON(item)
                    log.type = req.params.resource
                    log.child_id = req.params.child_id
                    activityLogs.push(log)
                })
            }

            const result: MultiStatus<Log> = await this._activityLogService.addLogs(activityLogs)
            return res.status(HttpStatus.CREATED).send(result)
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
        try {
            const result: PhysicalActivityLog = await this._activityLogService
                .getByChildAndDate(req.params.child_id, req.params.date_start, req.params.date_end, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityLogFound())
            return res.status(HttpStatus.OK).send(result)
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
    @httpGet('/:child_id/physicalactivities/logs/:resource/date/:date_start/:date_end')
    public async getLogByResource(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Log> = await this._activityLogService
                .getByChildResourceAndDate(req.params.child_id, req.params.resource, req.params.date_start, req.params.date_end,
                    new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityLogFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
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

    private getMessageNotActivityLogFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Physical Activity log not found!',
            'Physical Activity log not found. A new operation for the same resource is not required!'
        ).toJson()
    }
}
