import { IRepository } from './repository.interface'
import { Device } from '../domain/model/device'

export interface IDeviceRepository extends IRepository<Device> {
    checkExists(device: Device): Promise<boolean>

    /**
     * Removes environment according to its unique identifier and related institution.
     *
     * @param deviceId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByInstitution(deviceId: string | number, institutionId: string): Promise<boolean>

    /**
     * Returns the total of devices of an Institution.
     *
     * @param institutionId Institution id associated with devices.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countByInstitution(institutionId: string): Promise<number>
}
