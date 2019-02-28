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
            const conn = new Connection('amqp://username:password@host:port/vhost'
                    .replace('host', process.env.RABBITMQ_HOST || Default.RABBITMQ_HOST)
                    .replace('port', (process.env.RABBITMQ_PORT || Default.RABBITMQ_PORT).toString())
                    .replace('vhost', 'ocariot')
                    .replace('username', process.env.RABBITMQ_USERNAME || Default.RABBITMQ_USERNAME)
                    .replace('password', process.env.RABBITMQ_PASSWORD || Default.RABBITMQ_PASSWORD)
                ,
                {}, { retries: _retries, interval: _interval })
            await conn.initialized
            return Promise.resolve(conn)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
