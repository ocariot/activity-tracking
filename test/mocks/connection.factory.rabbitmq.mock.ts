import { IConnectionFactory, IEventBusOptions } from '../../src/infrastructure/port/connection.factory.interface'

export class ConnectionFactoryRabbitMQMock implements IConnectionFactory {
    public createConnection(uri: string, options?: IEventBusOptions): Promise<any> {
        return Promise.resolve({})
    }
}
