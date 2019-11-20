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
import { MultiStatus } from '../../application/domain/model/multi.status'
import { IQuery } from '../../application/port/query.interface'
import { Strings } from '../../utils/strings'
import { StatusError } from '../../application/domain/model/status.error'
import { ValidationException } from '../../application/domain/exception/validation.exception'

/**
 * Controller that implements PhysicalActivity feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
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
     * Add new physical physicalactivity or multiple new physical activities.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/physicalactivities')
    public async saveActivity(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of PhysicalActivity
            if (req.body instanceof Array) {
                const invalidItems: Array<StatusError<PhysicalActivity>> = new Array<StatusError<PhysicalActivity>>()
                const activitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivity>()
                req.body.forEach(item => {
                    try {
                        const activityItem: PhysicalActivity = new PhysicalActivity().fromJSON(item)
                        activityItem.child_id = req.params.child_id
                        activitiesArr.push(activityItem)
                    } catch (err) {
                        // when unable to successfully form the object through fromJSON()
                        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                        if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST

                        // Create a StatusError object for the construction of the MultiStatus response.
                        const statusError: StatusError<PhysicalActivity> = new StatusError<PhysicalActivity>(statusCode, err.message,
                            err.description, item)
                        invalidItems.push(statusError)
                    }
                })

                const resultMultiStatus: MultiStatus<PhysicalActivity> = await this._activityService.add(activitiesArr)
                if (invalidItems.length > 0) {
                    invalidItems.forEach(invalidItem => {
                        resultMultiStatus.error.push(invalidItem)
                    })
                }
                return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
            }

            // Only one item
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
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ child_id: req.params.child_id })
            const result = await this._activityService
                .getAllByChild(req.params.child_id, query)
            const count: number = await this._activityService.countByChild(req.params.child_id)
            res.setHeader('X-Total-Count', count)
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
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.physicalactivity_id, child_id: req.params.child_id })
            const result: PhysicalActivity = await this._activityService
                .getByIdAndChild(req.params.physicalactivity_id, req.params.child_id, query)
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
        // try {
        //     const physicalActivity: PhysicalActivity = new PhysicalActivity().fromJSON(req.body)
        //     physicalActivity.id = req.params.physicalactivity_id
        //     physicalActivity.child_id = req.params.child_id
        //
        //     const result = await this._activityService.updateByChild(physicalActivity)
        //     if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotActivityFound())
        //     return res.status(HttpStatus.OK).send(result)
        // } catch (err) {
        //     const handlerError = ApiExceptionManager.build(err)
        //     return res.status(handlerError.code)
        //         .send(handlerError.toJson())
        // }
        return res.status(HttpStatus.METHOD_NOT_ALLOWED)
            .send(new ApiException(HttpStatus.METHOD_NOT_ALLOWED, Strings.ERROR_MESSAGE.DISCONTINUED_METHOD).toJson())
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
     * Default message when resource is not found or does not exist.
     */
    private getMessageNotActivityFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Physical Activity not found!',
            'Physical Activity not found or already removed. A new operation for the same resource is not required.'
        ).toJson()
    }
}
