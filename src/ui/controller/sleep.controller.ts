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

/**
 * Controller that implements Sleep feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/children')
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
     * Retrieve sleep list of all children.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/sleep')
    public async getAllSleep(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._sleepService.getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Add new sleep.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/sleep')
    public async saveSleep(@request() req: Request, @response() res: Response) {
        try {
            const sleepSave: Sleep = new Sleep().fromJSON(req.body)
            sleepSave.child_id = req.params.child_id

            const result: Sleep = await this._sleepService.add(sleepSave)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
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
            const result = await this._sleepService
                .getAllByChild(req.params.child_id, new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
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
            const result: Sleep = await this._sleepService
                .getByIdAndChild(req.params.sleep_id, req.params.child_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageSleepNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
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
        try {
            const sleepUpdate: Sleep = new Sleep().fromJSON(req.body)
            sleepUpdate.id = req.params.sleep_id

            const result = await this._sleepService.updateByChild(sleepUpdate, req.params.child_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageSleepNotFound())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
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
                .send(handlerError.toJson())
        }
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageSleepNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Sleep not found!',
            'Sleep not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
