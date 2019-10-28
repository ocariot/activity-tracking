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
import { IBodyFatService } from '../../application/port/body.fat.service.interface'
import { BodyFat } from '../../application/domain/model/body.fat'
import { IQuery } from '../../application/port/query.interface'
import { MeasurementType } from '../../application/domain/model/measurement'

/**
 * Controller that implements BodyFat feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
export class BodyFatController {

    /**
     * Creates an instance of BodyFat controller.
     *
     * @param {IBodyFatService} _bodyFatService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.BODY_FAT_SERVICE) private readonly _bodyFatService: IBodyFatService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new BodyFat or multiple new BodyFat objects.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/bodyfats')
    public async saveFat(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of BodyFat
            if (req.body instanceof Array) {
                const bodyFatArr: Array<BodyFat> = req.body.map(item => {
                    const bodyFatItem: BodyFat = new BodyFat().fromJSON(item)
                    bodyFatItem.child_id = req.params.child_id
                    return bodyFatItem
                })

                const resultMultiStatus: MultiStatus<BodyFat> = await this._bodyFatService.add(bodyFatArr)
                return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
            }

            // Only one item
            const bodyFatSave: BodyFat = new BodyFat().fromJSON(req.body)
            bodyFatSave.child_id = req.params.child_id

            const result: BodyFat = await this._bodyFatService.add(bodyFatSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Recovers BodyFat of the child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/bodyfats')
    public async getAllBodyFatOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ child_id: req.params.child_id, type: MeasurementType.BODY_FAT })
            const result = await this._bodyFatService
                .getAllByChild(req.params.child_id, query)
            const count: number = await this._bodyFatService.countBodyFats(req.params.child_id)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get BodyFat by id and child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/bodyfats/:bodyfat_id')
    public async getBodyFatById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.bodyfat_id, child_id: req.params.child_id })
            const result: BodyFat = await this._bodyFatService
                .getByIdAndChild(req.params.bodyfat_id, req.params.child_id, query)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageBodyFatNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove BodyFat of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/bodyfats/:bodyfat_id')
    public async deleteBodyFatOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._bodyFatService.removeByChild(req.params.bodyfat_id, req.params.child_id)
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
    private getMessageBodyFatNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Body Fat not found!',
            'Body Fat not found or already removed. A new operation for the same resource is not required.'
        ).toJson()
    }
}
