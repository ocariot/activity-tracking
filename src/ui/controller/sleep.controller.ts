import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { Child } from '../../application/domain/model/child'
import { ILogger } from '../../utils/custom.logger'
import { ISleepService } from '../../application/port/sleep.service.interface'
import { Sleep } from '../../application/domain/model/sleep'

/**
 * Controller that implements Sleep feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/:user_id/sleep')
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
     * Add new sleep.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async addSleep(@request() req: Request, @response() res: Response) {
        try {
            const user = new Child()
            const sleep: Sleep = new Sleep().deserialize(req.body)
            user.setId(req.params.user_id)
            sleep.setUser(user)

            const result: Sleep = await this._sleepService.add(sleep)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all sleep by child.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllSleepByUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._sleepService
                .getAllByUser(req.params.user_id, new Query().deserialize(req.query))
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
    @httpGet('/:sleep_id')
    public async getSleepByIdAnByUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Sleep = await this._sleepService
                .getByIdAndUser(req.params.sleep_id, req.params.user_id, new Query().deserialize(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundSleep())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update sleep by child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:sleep_id')
    public async updateSleepByUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const sleep: Sleep = new Sleep().deserialize(req.body)
            sleep.setId(req.params.sleep_id)
            const result = await this._sleepService.updateByUser(sleep, req.params.user_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundSleep())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove sleep by child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:sleep_id')
    public async removeSleepByUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._sleepService.removeByUser(req.params.sleep_id, req.params.user_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundSleep())
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
    private getMessageNotFoundSleep(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Sleep not found!',
            'Sleep not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
