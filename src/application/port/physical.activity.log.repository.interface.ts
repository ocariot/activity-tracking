import { IRepository } from './repository.interface'
import { PhysicalActivityLog } from 'application/domain/model/physical.activity.log'

/**
 * Interface of the physicalactivitylog repository
 * Must be implemented by the physicalactivitylog repository at the infrastructure layer.
 * 
 * @see {@link }
 * @extends {IRepository<PhysicalActivityLog>}
 */
export interface IPhysicalActivityLogRepository extends IRepository<PhysicalActivityLog> {

}
