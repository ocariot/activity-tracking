import HttpStatus from 'http-status-codes'
import { controller, httpDelete, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IDeviceService } from '../../application/port/device.service.interface'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Device } from '../../application/domain/model/device'
import { Query } from '../../infrastructure/repository/query/query'
import { Strings } from '../../utils/strings'
import { ApiException } from '../exception/api.exception'
import { IQuery } from '../../application/port/query.interface'

@controller('/v1/institutions/:institution_id/devices')
export class DeviceController {
    constructor(
        @inject(Identifier.DEVICE_SERVICE) private readonly _service: IDeviceService
    ) {
    }

    @httpPost('/')
    public async addDevice(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const device: Device = new Device().fromJSON(req.body)
            device.institutionId = req.params.institution_id
            const result: Device = await this._service.add(device)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        } finally {
            req.query = {}
        }
    }

    @httpGet('/')
    public async getAllDevices(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            const result: Array<Device> = await this._service.getAllByInstitution(req.params.institution_id, query)
            const count: number = await this._service.countByInstitution(req.params.institution_id)
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        } finally {
            req.query = {}
        }
    }

    @httpGet('/:device_id')
    public async getDevice(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            const result: Device = await this._service.getByIdAndInstitutionId(
                req.params.device_id, req.params.institution_id, query
            )
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageDeviceNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        } finally {
            req.query = {}
        }
    }

    @httpDelete('/:device_id')
    public async deleteDeviceFromPatient(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._service.removeByInstitution(req.params.device_id, req.params.institution_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    private toJSONView(item: Device | Array<Device>): object {
        if (item instanceof Array) return item.map(device => device.toJSON())
        return item.toJSON()
    }

    private getMessageDeviceNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.DEVICE.NOT_FOUND,
            Strings.DEVICE.NOT_FOUND_DESC
        ).toJSON()
    }
}
