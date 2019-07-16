import { Connection } from 'amqp-ts'
import { injectable } from 'inversify'
import { IConnectionFactory } from '../../port/connection.factory.interface'
import { Default } from '../../../utils/default'

@injectable()
export class ConnectionFactoryRabbitMQ implements IConnectionFactory {
    /**
     * Create instance of {@link Connection} Class belonging
     * to the amqp-ts library to connect to RabbitMQ.
     *
     * @param _retries Total attempts to be made until give up reconnecting
     * @param _interval Interval in milliseconds between each attempt
     * @return Promise<Connection>
     */
    public async createConnection(_retries: number, _interval: number): Promise<Connection> {
        try {
            const conn = new Connection(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                {}, { retries: _retries, interval: _interval })
            await conn.initialized
            return Promise.resolve(conn)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
