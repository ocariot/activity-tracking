import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ILogger } from '../../utils/custom.logger'
import { Environment } from '../../application/domain/model/environment'
import { IEnvironmentService } from '../../application/port/environment.service.interface'
import { ApiException } from '../exception/api.exception'

/**
 * Controller that implements Environment feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/environments')
export class EnvironmentController {

    /**
     * Creates an instance of Environment controller.
     *
     * @param {IEnvironmentService} _environmentService
     * @param {ILogger} logger
     */
    constructor(
        @inject(Identifier.ENVIRONMENT_SERVICE) private readonly _environmentService: IEnvironmentService,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
    }

    /**
     * Add new environment measurement.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async addEnvironment(@request() req: Request, @response() res: Response) {
        try {
            const environment: Environment = new Environment().deserialize(req.body)
            const result: Environment = await this._environmentService.add(environment)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all ambient measurements.
     *
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllEnvironments(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result = await this._environmentService.getAll(new Query().deserialize(req.query))
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
    @httpDelete('/:environment_id')
    public async removeEnvironmentById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._environmentService.remove(req.params.environment_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundEnvironment())
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
    private getMessageNotFoundEnvironment(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Measurement of environment not found!',
            'Measurement of environment not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
