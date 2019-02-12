import { inject, injectable } from 'inversify'
import { Exchange, Message, Queue } from 'amqp-ts'
import { IEventBus } from '../../port/event.bus.interface'
import { IRabbitMQConnection } from '../../port/rabbitmq.connection.interface'
import { Default } from '../../../utils/default'
import { IntegrationEvent } from '../../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../../application/integration-event/handler/integration.event.handler.interface'
import { Identifier } from '../../../di/identifiers'
import { IDisposable } from '../../port/disposable.interface'
import { ILogger } from '../../../utils/custom.logger'
import StartConsumerResult = Queue.StartConsumerResult

@injectable()
export class EventBusRabbitMQ implements IEventBus, IDisposable {
    private event_handlers: Map<string, IIntegrationEventHandler<IntegrationEvent<any>>>
    private queue_consumer: boolean
    private queue!: Queue

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION) private _connectionPub: IRabbitMQConnection,
        @inject(Identifier.RABBITMQ_CONNECTION) private _connectionSub: IRabbitMQConnection,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.event_handlers = new Map()
        this.queue_consumer = false
    }

    /**
     * Publish in topic.
     *
     * @param event {IntegrationEvent}
     * @param routing_key {string}
     * @return {Promise<void>}
     */
    public async publish(event: IntegrationEvent<any>, routing_key: string): Promise<void> {
        if (!this._connectionPub.isConnected) await this._connectionPub.tryConnect()
        if (!this._connectionPub.conn) return

        await this._connectionPub.conn.completeConfiguration()

        const exchange: Exchange = this._connectionPub.conn.declareExchange(event.type, 'topic', { durable: true })

        const message: Message = new Message(event.toJSON())
        message.properties.appId = Default.APP_ID
        exchange.send(message, routing_key) // message, key

        this._logger.info(`Event "${event.event_name}" published in RabbitMQ.`)
    }

    /**
     * Subscribe in topic.
     * Os eventos q
     *
     * @param event {IntegrationEvent}
     * @param handler {IIntegrationEventHandler<IntegrationEvent>}
     * @param routing_key {string}
     *
     * @return {Promise<void>}
     */
    public async subscribe(event: IntegrationEvent<any>, handler: IIntegrationEventHandler<IntegrationEvent<any>>,
                           routing_key: string): Promise<void> {
        if (!this._connectionSub.isConnected) await this._connectionSub.tryConnect()
        if (this.event_handlers.has(event.event_name) || !this._connectionSub.conn) return

        this.queue = this._connectionSub.conn.declareQueue(Default.RABBITMQ_QUEUE_NAME, { durable: true })

        const exchange: Exchange = this._connectionSub.conn.declareExchange(event.type, 'topic', { durable: true })

        const initialized = await exchange.initialized
        if (initialized) {
            this.event_handlers.set(event.event_name, handler)
            await this.queue.bind(exchange, routing_key)
            await this.internalSubscribe()

            this._logger.info(`Subscribe event: ${event.event_name}`)
        } else {
            this._logger.error(`Subscribe event ERROR EXCHANGE: ${event.event_name}`)
        }
    }

    /**
     * Internal Subscribe.
     * Ensures that the queue will only be consumed once.
     * Events handle are returned for the specific subscribe.
     *
     * @return Promise<void>
     */
    private async internalSubscribe(): Promise<void> {
        if (!this.queue) return

        if (!this.queue_consumer) {
            this.queue_consumer = true
            await this.queue
                .activateConsumer((message: Message) => {
                    if (message.properties.appId === Default.APP_ID) return

                    this._logger.info(`Bus event message received!`)
                    const event_name: string = message.getContent().event_name

                    if (event_name) {
                        const event_handler: IIntegrationEventHandler<IntegrationEvent<any>> | undefined =
                            this.event_handlers.get(event_name)
                        if (event_handler) {
                            event_handler.handle(message.getContent())
                        }
                    }
                }, { noAck: true })
                .then((result: StartConsumerResult) => {
                    this._logger.info('Queue consumer successfully created!')
                })
        }
    }

    /**
     * Releases the resources.
     *
     * @return {Promise<void>}
     */
    public async dispose(): Promise<void> {
        if (this.queue) {
            await this.queue.stopConsumer()
            await this.queue.close()
        }
        if (this._connectionPub.conn) await this._connectionPub.conn.close()
        if (this._connectionSub.conn) await this._connectionSub.conn.close()
        this._connectionPub.conn = undefined
    }
}
