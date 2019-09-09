import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Log } from '../../application/domain/model/log'
import { MultiStatus } from '../../application/domain/model/multi.status'
import HttpStatus from 'http-status-codes'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ChildLog } from '../../application/domain/model/child.log'
import { Query } from '../../infrastructure/repository/query/query'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogService } from '../../application/port/log.service.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Controller that implements PhysicalActivity feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
export class LogController {

    /**
     * Creates an instance of PhysicalActivity controller.
     *
     * @param {ILogService} _logService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.LOG_SERVICE) private readonly _logService: ILogService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new child log.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:child_id/logs/:resource')
    public async saveLog(@request() req: Request, @response() res: Response) {
        try {
            let activityLogs: Array<Log> = []
            if (req.body instanceof Array) {
                activityLogs = req.body.map(item => {
                    const log: Log = new Log().fromJSON(item)
                    log.type = req.params.resource
                    log.child_id = req.params.child_id
                    return log
                })
            }

            const result: MultiStatus<Log> = await this._logService.addLogs(activityLogs)
            return res.status(HttpStatus.MULTI_STATUS).send(result)
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
    @httpGet('/:child_id/logs/date/:date_start/:date_end')
    public async getLogs(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: ChildLog = await this._logService
                .getByChildAndDate(req.params.child_id, req.params.date_start, req.params.date_end, new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Recover the logs by type.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id/logs/:resource/date/:date_start/:date_end')
    public async getLogsByResource(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Log> = await this._logService
                .getByChildResourceAndDate(req.params.child_id, req.params.resource, req.params.date_start, req.params.date_end,
                    new Query().fromJSON(req.query))
            const count: number = await this._logService.countLogsByResource(
                req.params.child_id, req.params.resource, req.params.date_start, req.params.date_end)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }
}
