import { Connection } from 'amqp-ts'
import { inject, injectable } from 'inversify'
import { IRabbitMQConnection } from '../../port/rabbitmq.connection.interface'
import { IConnectionFactory } from '../../port/connection.factory.interface'
import { Identifier } from '../../../di/identifiers'

/**
 * Implementation of the interface that provides conn with RabbitMQ.
 * To implement the RabbitMQ abstraction the amqp-ts library was used.
 *
 * @see {@link https://github.com/abreits/amqp-ts} for more details.
 * @implements {IRabbitMQConnection}
 */
@injectable()
export class RabbitMQConnection implements IRabbitMQConnection {
    private _connection?: Connection

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION_FACTORY) private readonly _connectionFactory: IConnectionFactory
    ) {
    }

    get isConnected(): boolean {
        return !!(this._connection)
    }

    get conn(): Connection | undefined {
        return this._connection
    }

    /**
     * Routine to connect to RabbitMQ.
     * When there is no connection to RabbitMQ, new attempts
     * are made to connect according to the parameter {@link _options}
     * which sets the total number of retries and the delay
     *
     * @param retries Total attempts to be made until give up reconnecting
     * @param interval Interval in milliseconds between each attempt
     * @return Promise<void>
     */
    public tryConnect(retries: number, interval: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._connection) return resolve()

            this._connectionFactory
                .createConnection(retries, interval)
                .then((connection: Connection) => {
                    this._connection = connection
                    return resolve()
                })
                .catch(err => {
                    this._connection = undefined
                    return reject(err)
                })
        })
    }
}
