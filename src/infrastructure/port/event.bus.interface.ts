import { IDisposable } from './disposable.interface'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../application/integration-event/handler/integration.event.handler.interface'
import { IEventBusConnection } from './event.bus.connection.interface'

export interface IEventBus extends IDisposable {
    connectionPub: IEventBusConnection
    connectionSub: IEventBusConnection

    publish(event: IntegrationEvent<any>, routing_key: string): Promise<boolean>

    subscribe(
        event: IntegrationEvent<any>,
        handler: IIntegrationEventHandler<IntegrationEvent<any>>,
        routing_key: string
    ): Promise<boolean>

    enableLogger(value: boolean): void
}
