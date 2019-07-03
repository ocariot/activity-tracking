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

/**
 * Controller that implements Weight feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/users/children')
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
    @httpPost('/:child_id/weight')
    public async saveWeight(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of Weight
            if (req.body instanceof Array) {
                const weightArr: Array<Weight> = req.body.map(item => {
                    const weightItem: Weight = new Weight().fromJSON(item)
                    weightItem.child_id = req.params.child_id
                    if (weightItem.fat) weightItem.fat.child_id = req.params.child_id
                    return weightItem
                })

                const resultMultiStatus: MultiStatus<Weight> = await this._weightService.add(weightArr)
                return res.status(HttpStatus.CREATED).send(resultMultiStatus)
            }

            // Only one item
            const weightSave: Weight = new Weight().fromJSON(req.body)
            weightSave.child_id = req.params.child_id
            if (weightSave.fat) weightSave.fat.child_id = req.params.child_id

            const result: Weight = await this._weightService.add(weightSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
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
    @httpGet('/:child_id/weight')
    public async getAllWeightOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._weightService
                .getAllByChild(req.params.child_id, new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
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
    @httpGet('/:child_id/weight/:weight_id')
    public async getWeightById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Weight = await this._weightService
                .getByIdAndChild(req.params.weight_id, req.params.child_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageWeightNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove Weight of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/weight/:weight_id')
    public async deleteWeightOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._weightService.removeByChild(req.params.weight_id, req.params.child_id)
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
    private getMessageWeightNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Weight not found!',
            'Weight not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
