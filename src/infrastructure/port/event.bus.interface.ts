import { IDisposable } from './disposable.interface'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../application/integration-event/handler/integration.event.handler.interface'

export interface IEventBus extends IDisposable {
    publish(event: IntegrationEvent<any>, routing_key: string): void

    subscribe(event: IntegrationEvent<any>, handler: IIntegrationEventHandler<IntegrationEvent<any>>, routing_key: string): void
}
