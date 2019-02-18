import { IEventBus } from '../../src/infrastructure/port/event.bus.interface'
import { IntegrationEvent } from '../../src/application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../src/application/integration-event/handler/integration.event.handler.interface'
import { IRabbitMQConnection } from '../../src/infrastructure/port/rabbitmq.connection.interface'

export class EventBusRabbimqMock implements IEventBus {
    public connectionPub: IRabbitMQConnection
    public connectionSub: IRabbitMQConnection

    constructor(connectionPub: IRabbitMQConnection, connectionSub: IRabbitMQConnection) {
        this.connectionPub = connectionPub
        this.connectionSub = connectionSub
    }

    public publish(event: IntegrationEvent<any>, routing_key: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public subscribe(
        event: IntegrationEvent<any>,
        handler: IIntegrationEventHandler<IntegrationEvent<any>>,
        routing_key: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public dispose(): Promise<void> {
        return Promise.resolve()
    }
}
