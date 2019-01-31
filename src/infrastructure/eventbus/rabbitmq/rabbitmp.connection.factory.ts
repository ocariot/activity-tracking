import { Connection } from 'amqp-ts'
import { injectable } from 'inversify'
import { IConnectionFactory } from '../../port/connection.factory.interface'
import { Default } from '../../../utils/default'

@injectable()
export class RabbitMQConnectionFactory implements IConnectionFactory {
    protected options = { retries: Default.RABBITMQ_CON_RETRY_COUNT, interval: Default.RABBITMQ_CON_RETRY_INTERVAL }

    /**
     * Create instance of {@link Connection} Class belonging
     * to the amqp-ts library to connect to RabiitMQ.
     *
     * @return Promise<Connection>
     */
    public createConnection(): Promise<Connection> {
        return new Promise<Connection>((resolve, reject) => {
            const conn = new Connection(this.getAmqpUri(), {}, this.options)
            resolve(conn)
        })
    }

    /**
     * Retrieve the URI for connection to RabbitMQ.
     *
     * @return {string}
     */
    protected getAmqpUri(): string {
        return process.env.RABBITMQ_AMQP_URI || Default.RABBITMQ_AMQP_URI
    }
}
