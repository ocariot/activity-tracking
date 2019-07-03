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
import { IFatService } from '../../application/port/fat.service.interface'
import { Fat } from '../../application/domain/model/fat'

/**
 * Controller that implements Fat feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/users/children')
export class FatController {

    /**
     * Creates an instance of Fat controller.
     *
     * @param {IFatService} _fatService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.FAT_SERVICE) private readonly _fatService: IFatService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new Fat or multiple new Fat objects.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/fat')
    public async saveFat(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of Fat
            if (req.body instanceof Array) {
                const fatArr: Array<Fat> = req.body.map(item => {
                    const fatItem: Fat = new Fat().fromJSON(item)
                    fatItem.child_id = req.params.child_id
                    return fatItem
                })

                const resultMultiStatus: MultiStatus<Fat> = await this._fatService.add(fatArr)
                return res.status(HttpStatus.CREATED).send(resultMultiStatus)
            }

            // Only one item
            const fatSave: Fat = new Fat().fromJSON(req.body)
            fatSave.child_id = req.params.child_id

            const result: Fat = await this._fatService.add(fatSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Recovers Fat of the child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/fat')
    public async getAllFatOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._fatService
                .getAllByChild(req.params.child_id, new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get Fat by id and child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/fat/:fat_id')
    public async getFatById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Fat = await this._fatService
                .getByIdAndChild(req.params.fat_id, req.params.child_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFatNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove Fat of the child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:child_id/fat/:fat_id')
    public async deleteFatOfChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._fatService.removeByChild(req.params.fat_id, req.params.child_id)
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
    private getMessageFatNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Fat not found!',
            'Fat not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
