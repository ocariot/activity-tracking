import { IEventBus } from '../../src/infrastructure/port/eventbus.interface'
import { IConnectionFactory, IEventBusOptions } from '../../src/infrastructure/port/connection.factory.interface'

export class RabbitMQMock implements IEventBus {
    public bus: any

    constructor(private readonly connectionFactory: IConnectionFactory) {
    }

    public async initialize(uri: string, options?: IEventBusOptions): Promise<void> {
        this.bus = await this.connectionFactory.createConnection(uri, options)
        return Promise.resolve()
    }

    public dispose(): Promise<void> {
        return Promise.resolve()
    }
}
