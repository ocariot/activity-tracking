import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { Device } from '../../application/domain/model/device'
import { DeviceEntity } from '../entity/device.entity'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { IDeviceRepository } from '../../application/port/device.repository.interface'
import { Query } from './query/query'

@injectable()
export class DeviceRepository extends BaseRepository<Device, DeviceEntity> implements IDeviceRepository {
    constructor(
        @inject(Identifier.DEVICE_REPO_MODEL) readonly _model: any,
        @inject(Identifier.DEVICE_ENTITY_MAPPER) readonly _entityMapper: IEntityMapper<Device, DeviceEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_model, _entityMapper, _logger)
    }

    public checkExists(device: Device): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const query: Query = new Query()
            if (!device.id && !device.address) return resolve(false)

            if (device.id) query.addFilter({ _id: device.id })
            if (device.address) query.addFilter({ address: device.address })
            super.findOne(query)
                .then(result => resolve(!!result))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public countByInstitution(institutionId: string): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { institution_id: institutionId } }))
    }

    public removeByInstitution(deviceId: string | number, institutionId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._model.findOneAndDelete({ _id: deviceId, institution_id: institutionId })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
