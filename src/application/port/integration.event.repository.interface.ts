import { IRepository } from './repository.interface'

/**
 * Interface of the integration event repository.
 * Must be implemented by the integration event repository at the infrastructure layer.
 *
 * @see {@link IntegrationEventRepository} for further information.
 * @extends {IRepository<object>}
 */
export interface IIntegrationEventRepository extends IRepository<any> {
}
