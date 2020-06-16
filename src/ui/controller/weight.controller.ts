import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { MultiStatus } from '../../application/domain/model/multi.status'
import { IWeightService } from '../../application/port/weight.service.interface'
import { Weight } from '../../application/domain/model/weight'
import { IQuery } from '../../application/port/query.interface'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { StatusError } from '../../application/domain/model/status.error'

/**
 * Controller that implements Weight feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
export class WeightController {

    /**
     * Creates an instance of Weight controller.
     *
     * @param {IWeightService} _weightService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.WEIGHT_SERVICE) private readonly _weightService: IWeightService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new Weight or multiple new Weight objects.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/weights')
    public async saveWeight(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of Weight
            if (req.body instanceof Array) {
                const invalidItems: Array<StatusError<Weight>> = new Array<StatusError<Weight>>()
                const weightArr: Array<Weight> = new Array<Weight>()
                req.body.forEach(item => {
                    try {
                        const weightItem: Weight = new Weight().fromJSON(item)
                        weightItem.child_id = req.params.child_id
                        if (weightItem.body_fat) weightItem.body_fat.child_id = req.params.child_id
                        weightArr.push(weightItem)
                    } catch (err) {
                        // when unable to successfully form the object through fromJSON()
                        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                        if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST

                        // Create a StatusError object for the construction of the MultiStatus response.
                        const statusError: StatusError<Weight> = new StatusError<Weight>(statusCode, err.message,
                            err.description, item)
                        invalidItems.push(statusError)
                    }
                })

                const resultMultiStatus: MultiStatus<Weight> = await this._weightService.add(weightArr)
                if (invalidItems.length > 0) {
                    invalidItems.forEach(invalidItem => {
                        resultMultiStatus.error.push(invalidItem)
                    })
                }
                return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
            }

            // Only one item
            const weightSave: Weight = new Weight().fromJSON(req.body)
            weightSave.child_id = req.params.child_id
            if (weightSave.body_fat) weightSave.body_fat.child_id = req.params.child_id

            const result: Weight = await this._weightService.add(weightSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Recovers Weight of the child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/weights')
    public async getAllWeightOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ child_id: req.params.child_id })
            const result = await this._weightService
                .getAllByChild(req.params.child_id, query)
            const count: number = await this._weightService.countByChild(req.params.child_id)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Get Weight by id and child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/weights/:weight_id')
    public async getWeightById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.weight_id, child_id: req.params.child_id })
            const result: Weight = await this._weightService
                .getByIdAndChild(req.params.weight_id, req.params.child_id, query)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageWeightNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Remove Weight of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/weights/:weight_id')
    public async deleteWeightOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._weightService.removeByChild(req.params.weight_id, req.params.child_id)
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
    private getMessageWeightNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Weight not found!',
            'Weight not found or already removed. A new operation for the same resource is not required.'
        ).toJSON()
    }
}
