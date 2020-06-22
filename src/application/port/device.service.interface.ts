import { IService } from './service.interface'
import { Device } from '../domain/model/device'
import { IQuery } from './query.interface'

export interface IDeviceService extends IService<Device> {
    /**
     * List the devices of a Institution.
     *
     * @param institutionId Institution ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Device>>}
     * @throws {RepositoryException}
     */
    getAllByInstitution(institutionId: string, query: IQuery): Promise<Array<Device>>

    /**
     * List info the device of a Institution.
     *
     * @param deviceId Environment unique identifier.
     * @param institutionId Institution ID.
     * @param query Defines object to be used for queries.
     * @return {Promise<Device>}
     * @throws {RepositoryException}
     */
    getByIdAndInstitutionId(deviceId: string, institutionId: string, query: IQuery): Promise<Device>

    /**
     * Removes environment according to its unique identifier and related institution.
     *
     * @param deviceId Environment unique identifier.
     * @param institutionId Institution unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    removeByInstitution(deviceId: string, institutionId: string): Promise<boolean>

    /**
     * Returns the total of devices of an Institution.
     *
     * @param institutionId Institution id associated with devices.
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countByInstitution(institutionId: string): Promise<number>
}
