import { inject, injectable } from 'inversify'
import { IDeviceService } from '../port/device.service.interface'
import { Identifier } from '../../di/identifiers'
import { IDeviceRepository } from '../port/device.repository.interface'
import { IQuery } from '../port/query.interface'
import { Device } from '../domain/model/device'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { Strings } from '../../utils/strings'
import { CreateDeviceValidator } from '../domain/validator/create.device.validator'

@injectable()
export class DeviceService implements IDeviceService {
    constructor(
        @inject(Identifier.DEVICE_REPOSITORY) private readonly _repository: IDeviceRepository
    ) {
    }

    public async add(item: Device): Promise<Device> {
        CreateDeviceValidator.validate(item)
        const exists = await this._repository.checkExists(item)
        if (exists) throw new ConflictException(Strings.DEVICE.ALREADY_REGISTERED)
        return this._repository.create(item)
    }

    public getAllByInstitution(institutionId: string, query: IQuery): Promise<Array<Device>> {
        ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        query.addFilter({ institution_id: institutionId })
        return this._repository.find(query)
    }

    public getByIdAndInstitutionId(deviceId: string, institutionId: string, query: IQuery): Promise<Device> {
        ObjectIdValidator.validate(deviceId, Strings.DEVICE.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        query.addFilter({ _id: deviceId, institution_id: institutionId })
        return this._repository.findOne(query)
    }

    public getAll(query: IQuery): Promise<Array<Device>> {
        throw new Error('Not implemented!')
    }

    public async getById(id: string, query: IQuery): Promise<Device> {
        throw new Error('Not implemented!')
    }

    public async remove(id: string): Promise<boolean> {
        ObjectIdValidator.validate(id)
        return this._repository.delete(id)
    }

    public async update(item: Device): Promise<Device> {
        throw new Error('Not implemented!')
    }

    public countByInstitution(institutionId: string): Promise<number> {
        ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        return this._repository.countByInstitution(institutionId)
    }

    public removeByInstitution(deviceId: string, institutionId: string): Promise<boolean> {
        ObjectIdValidator.validate(deviceId, Strings.DEVICE.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(institutionId, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        return this._repository.removeByInstitution(deviceId, institutionId)
    }
}
