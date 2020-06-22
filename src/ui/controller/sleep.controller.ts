import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { ISleepService } from '../../application/port/sleep.service.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { Sleep } from '../../application/domain/model/sleep'
import { MultiStatus } from '../../application/domain/model/multi.status'
import { IQuery } from '../../application/port/query.interface'
import { Strings } from '../../utils/strings'
import { StatusError } from '../../application/domain/model/status.error'
import { ValidationException } from '../../application/domain/exception/validation.exception'

/**
 * Controller that implements Sleep feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
export class SleepController {

    /**
     * Creates an instance of Sleep controller.
     *
     * @param {ISleepService} _sleepService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.SLEEP_SERVICE) private readonly _sleepService: ISleepService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new sleep or multiple new sleep objects.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/sleep')
    public async saveSleep(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of Sleep
            if (req.body instanceof Array) {
                const invalidItems: Array<StatusError<Sleep>> = new Array<StatusError<Sleep>>()
                const sleepArr: Array<Sleep> = new Array<Sleep>()
                req.body.forEach(item => {
                    try {
                        const sleepItem: Sleep = new Sleep().fromJSON(item)
                        sleepItem.child_id = req.params.child_id
                        sleepArr.push(sleepItem)
                    } catch (err) {
                        // when unable to successfully form the object through fromJSON()
                        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                        if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST

                        // Create a StatusError object for the construction of the MultiStatus response.
                        const statusError: StatusError<Sleep> = new StatusError<Sleep>(statusCode, err.message,
                            err.description, item)
                        invalidItems.push(statusError)
                    }
                })

                const resultMultiStatus: MultiStatus<Sleep> = await this._sleepService.add(sleepArr)
                if (invalidItems.length > 0) {
                    invalidItems.forEach(invalidItem => {
                        resultMultiStatus.error.push(invalidItem)
                    })
                }
                return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
            }

            // Only one item
            const sleepSave: Sleep = new Sleep().fromJSON(req.body)
            sleepSave.child_id = req.params.child_id

            const result: Sleep = await this._sleepService.add(sleepSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Recovers sleep of the child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/sleep')
    public async getAllSleepOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ child_id: req.params.child_id })
            const result = await this._sleepService
                .getAllByChild(req.params.child_id, query)
            const count: number = await this._sleepService.countByChild(req.params.child_id)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Get sleep by id and child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/sleep/:sleep_id')
    public async getSleepById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.sleep_id, child_id: req.params.child_id })
            const result: Sleep = await this._sleepService
                .getByIdAndChild(req.params.sleep_id, req.params.child_id, query)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageSleepNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Update sleep of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:child_id/sleep/:sleep_id')
    public async updatesleepOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        // try {
        //     const sleepUpdate: Sleep = new Sleep().fromJSON(req.body)
        //     sleepUpdate.id = req.params.sleep_id
        //     sleepUpdate.child_id = req.params.child_id
        //
        //     const result = await this._sleepService.updateByChild(sleepUpdate)
        //     if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageSleepNotFound())
        //     return res.status(HttpStatus.OK).send(result)
        // } catch (err) {
        //     const handlerError = ApiExceptionManager.build(err)
        //     return res.status(handlerError.code)
        //         .send(handlerError.toJson())
        // }
        return res.status(HttpStatus.METHOD_NOT_ALLOWED)
            .send(new ApiException(HttpStatus.METHOD_NOT_ALLOWED, Strings.ERROR_MESSAGE.DISCONTINUED_METHOD).toJSON())
    }

    /**
     * Remove sleep of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/sleep/:sleep_id')
    public async deletesleepOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._sleepService.removeByChild(req.params.sleep_id, req.params.child_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageSleepNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Sleep not found!',
            'Sleep not found or already removed. A new operation for the same resource is not required.'
        ).toJSON()
    }
}
