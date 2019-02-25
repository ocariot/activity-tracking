import { IEventBus } from '../../src/infrastructure/port/event.bus.interface'
import { IntegrationEvent } from '../../src/application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../src/application/integration-event/handler/integration.event.handler.interface'
import { IEventBusConnection } from '../../src/infrastructure/port/event.bus.connection.interface'

export class EventBusRabbimqMock implements IEventBus {
    public connectionPub: IEventBusConnection
    public connectionSub: IEventBusConnection

    constructor(connectionPub: IEventBusConnection, connectionSub: IEventBusConnection) {
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

    public enableLogger(): void {
        // logger
    }
}
