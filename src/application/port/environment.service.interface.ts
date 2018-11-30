import { IService } from './service.interface'
import { Environment } from '../domain/model/environment'

/**
 * Environment service interface.
 *
 * @extends {IService}
 */
export interface IEnvironmentService extends IService<Environment> {
}
