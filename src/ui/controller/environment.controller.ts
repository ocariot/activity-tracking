import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ILogger } from '../../utils/custom.logger'
import { IEnvironmentService } from '../../application/port/environment.service.interface'
import { Environment } from '../../application/domain/model/environment'
import { Query } from '../../infrastructure/repository/query/query'
import { MultiStatus } from '../../application/domain/model/multi.status'
import { StatusError } from '../../application/domain/model/status.error'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { ApiException } from '../exception/api.exception'
import { Strings } from '../../utils/strings'
import { IQuery } from '../../application/port/query.interface'

/**
 * Controller that implements Environment feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1')
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
     * Add new environment measurement or multiple new environment measurements.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/environments')
    public async addEnvironment(@request() req: Request, @response() res: Response) {
        // try {
        //     // Multiple items of Environment
        //     if (req.body instanceof Array) {
        //         const invalidItems: Array<StatusError<Environment>> = new Array<StatusError<Environment>>()
        //         const environmentsArr: Array<Environment> = new Array<Environment>()
        //         req.body.forEach(item => {
        //             try {
        //                 environmentsArr.push(new Environment().fromJSON(item))
        //             } catch (err) {
        //                 // when unable to successfully form the object through fromJSON()
        //                 let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
        //                 if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
        //
        //                 // Create a StatusError object for the construction of the MultiStatus response.
        //                 const statusError: StatusError<Environment> = new StatusError<Environment>(statusCode, err.message,
        //                     err.description, item)
        //                 invalidItems.push(statusError)
        //             }
        //         })
        //
        //         const resultMultiStatus: MultiStatus<Environment> = await this._environmentService.add(environmentsArr)
        //         if (invalidItems.length > 0) {
        //             invalidItems.forEach(invalidItem => {
        //                 resultMultiStatus.error.push(invalidItem)
        //             })
        //         }
        //         return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
        //     }
        //
        //     // Only one item
        //     const environment: Environment = new Environment().fromJSON(req.body)
        //     const result: Environment = await this._environmentService.add(environment)
        //     return res.status(HttpStatus.CREATED).send(result)
        // } catch (err) {
        //     const handlerError = ApiExceptionManager.build(err)
        //     return res.status(handlerError.code)
        //         .send(handlerError.toJson())
        // }
        return res.status(HttpStatus.METHOD_NOT_ALLOWED)
            .send(new ApiException(HttpStatus.METHOD_NOT_ALLOWED, Strings.ERROR_MESSAGE.DISCONTINUED_METHOD,
                'Now use the route \'/v1/institutions/{institution_id}/environments\'').toJson())
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
    @httpGet('/environments')
    public async getAllEnvironments(@request() req: Request, @response() res: Response): Promise<Response> {
        // try {
        //     const result = await this._environmentService.getAll(new Query().fromJSON(req.query))
        //     const count: number = await this._environmentService.count()
        //     res.setHeader('X-Total-Count', count)
        //     return res.status(HttpStatus.OK).send(result)
        // } catch (err) {
        //     const handlerError = ApiExceptionManager.build(err)
        //     return res.status(handlerError.code)
        //         .send(handlerError.toJson())
        // }
        return res.status(HttpStatus.METHOD_NOT_ALLOWED)
            .send(new ApiException(HttpStatus.METHOD_NOT_ALLOWED, Strings.ERROR_MESSAGE.DISCONTINUED_METHOD,
                'Now use the route \'/v1/institutions/{institution_id}/environments\'').toJson())
    }

    /**
     * Remove environment by child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/environments/:environment_id')
    public async removeEnvironmentById(@request() req: Request, @response() res: Response): Promise<Response> {
        // try {
        //     await this._environmentService.remove(req.params.environment_id)
        //     return res.status(HttpStatus.NO_CONTENT).send()
        // } catch (err) {
        //     const handlerError = ApiExceptionManager.build(err)
        //     return res.status(handlerError.code)
        //         .send(handlerError.toJson())
        // }
        return res.status(HttpStatus.METHOD_NOT_ALLOWED)
            .send(new ApiException(HttpStatus.METHOD_NOT_ALLOWED, Strings.ERROR_MESSAGE.DISCONTINUED_METHOD,
                'Now use the route \'/v1/institutions/{institution_id}/environments/{environment_id}\'').toJson())
    }

    /**
     * NEW ROUTES FOR ENVIRONMENT MODEL
     */
    /**
     * Add new environment measurement or multiple new environment measurements.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/institutions/:institution_id/environments')
    public async addInstEnvironment(@request() req: Request, @response() res: Response) {
        try {
            // Multiple items of Environment
            if (req.body instanceof Array) {
                const invalidItems: Array<StatusError<Environment>> = new Array<StatusError<Environment>>()
                const environmentsArr: Array<Environment> = new Array<Environment>()
                req.body.forEach(item => {
                    try {
                        const environmentItem: Environment = new Environment().fromJSON(item)
                        environmentItem.institution_id = req.params.institution_id
                        environmentsArr.push(environmentItem)
                    } catch (err) {
                        // when unable to successfully form the object through fromJSON()
                        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                        if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST

                        // Create a StatusError object for the construction of the MultiStatus response.
                        const statusError: StatusError<Environment> = new StatusError<Environment>(statusCode, err.message,
                            err.description, item)
                        invalidItems.push(statusError)
                    }
                })

                const resultMultiStatus: MultiStatus<Environment> = await this._environmentService.add(environmentsArr)
                if (invalidItems.length > 0) {
                    invalidItems.forEach(invalidItem => {
                        resultMultiStatus.error.push(invalidItem)
                    })
                }
                return res.status(HttpStatus.MULTI_STATUS).send(resultMultiStatus)
            }

            // Only one item
            const environment: Environment = new Environment().fromJSON(req.body)
            environment.institution_id = req.params.institution_id

            const result: Environment = await this._environmentService.add(environment)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all Environments of an Institution.
     *
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/institutions/:institution_id/environments')
    public async getAllInstEnvironments(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ institution_id: req.params.institution_id })
            const result = await this._environmentService.getAllByInstitution(req.params.institution_id, query)
            const count: number = await this._environmentService.countByInstitution(req.params.institution_id)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove all Environments of an Institution
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/institutions/:institution_id/environments/')
    public async removeAllInstEnvironments(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ institution_id: req.params.institution_id })
            await this._environmentService.removeAllByInstitution(req.params.institution_id, query)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove an Environment of an Institution.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/institutions/:institution_id/environments/:environment_id')
    public async removeInstEnvironmentById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._environmentService.removeByInstitution(req.params.environment_id, req.params.institution_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }
}
