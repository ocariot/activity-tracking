import { IDisposable } from './disposable.interface'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../application/integration-event/handler/integration.event.handler.interface'
import { IRabbitMQConnection } from './rabbitmq.connection.interface'

export interface IEventBus extends IDisposable {
    connectionPub: IRabbitMQConnection
    connectionSub: IRabbitMQConnection

    publish(event: IntegrationEvent<any>, routing_key: string): Promise<boolean>

    subscribe(
        event: IntegrationEvent<any>,
        handler: IIntegrationEventHandler<IntegrationEvent<any>>,
        routing_key: string
    ): Promise<boolean>
}
