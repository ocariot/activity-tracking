import { inject, injectable } from 'inversify'
import amqp, { Exchange, Message, Queue } from 'amqp-ts'
import { IEventBus } from '../../port/event.bus.interface'
import { IRabbitMQConnection } from '../../port/rabbitmq.connection.interface'
import { Default } from '../../../utils/default'
import { IntegrationEvent } from '../../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../../application/integration-event/handler/integration.event.handler.interface'
import { Identifier } from '../../../di/identifiers'
import { IDisposable } from '../../port/disposable.interface'
import { ILogger } from '../../../utils/custom.logger'
import { EventBusException } from '../../../application/domain/exception/eventbus.exception'
import StartConsumerResult = Queue.StartConsumerResult

@injectable()
export class EventBusRabbitMQ implements IEventBus, IDisposable {
    private readonly RABBITMQ_QUEUE_NAME: string = 'tracking_queue'

    private event_handlers: Map<string, IIntegrationEventHandler<IntegrationEvent<any>>>
    private queue_consumer: boolean
    private queue!: Queue

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionPub: IRabbitMQConnection,
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionSub: IRabbitMQConnection,
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
     * @return {Promise<boolean>}
     */
    public async publish(event: IntegrationEvent<any>, routing_key: string): Promise<boolean> {
        try {
            if (!this.connectionPub.isConnected) {
                throw new EventBusException(`Could not publish the event: ${event.event_name}.`,
                    'There is no connection to RabbitMQ!')
            }
            if (!this.connectionPub.conn) return Promise.resolve(false)

            await this.connectionPub.conn.completeConfiguration()

            const exchange: Exchange = this.connectionPub.conn.declareExchange(event.type, 'topic', { durable: true })
            if (await exchange.initialized) {
                const message: Message = new Message(event.toJSON())
                message.properties.appId = Default.APP_ID
                exchange.send(message, routing_key)

                await exchange.close()
                return Promise.resolve(true)
            }
            throw new EventBusException(`Could not publish the event: ${event.event_name}.`,
                'An error occurred in the creation/initialization of Exchange.')
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Subscribe in topic.
     * Os eventos q
     *
     * @param event {IntegrationEvent}
     * @param handler {IIntegrationEventHandler<IntegrationEvent>}
     * @param routing_key {string}
     * @return {Promise<boolean>}
     */
    public async subscribe(event: IntegrationEvent<any>, handler: IIntegrationEventHandler<IntegrationEvent<any>>,
                           routing_key: string): Promise<boolean> {
        try {
            if (!this.connectionSub.isConnected) {
                throw new EventBusException(`Could not subscribe up for the event: ${event.event_name}.`,
                    'There is no connection to RabbitMQ!')
            }

            // Check if are already registered or there is no connection.
            if (this.event_handlers.has(event.event_name) || !this.connectionSub.conn) {
                return Promise.resolve(false)
            }

            this.queue = this.connectionSub.conn.declareQueue(this.RABBITMQ_QUEUE_NAME, { durable: true })

            const exchange: Exchange = this.connectionSub.conn.declareExchange(event.type, 'topic', { durable: true })
            if (await exchange.initialized) {
                this.event_handlers.set(event.event_name, handler)
                await this.queue.bind(exchange, routing_key)
                await this.internalSubscribe()

                return Promise.resolve(true)
            }
            throw new EventBusException(`Could not subscribe up for the event: ${event.event_name}.`,
                'An error occurred in the creation/initialization of Exchange.')
        } catch (err) {
            return Promise.reject(err)
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
                    message.ack() // acknowledge that the message has been received (and processed)

                    if (message.properties.appId === Default.APP_ID) return

                    // this._logger.info(`Bus event message received!`)
                    const event_name: string = message.getContent().event_name

                    if (event_name) {
                        const event_handler: IIntegrationEventHandler<IntegrationEvent<any>> | undefined =
                            this.event_handlers.get(event_name)
                        if (event_handler) {
                            event_handler.handle(message.getContent())
                        }
                    }
                }, { noAck: false })
                .then((result: StartConsumerResult) => {
                    this._logger.info('Queue consumer successfully created! ')
                })
                .catch(err => {
                    throw new EventBusException('Failed to activate the queue consumer!', err.message)
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
        if (this.connectionPub.conn) await this.connectionPub.conn.close()
        if (this.connectionSub.conn) await this.connectionSub.conn.close()
    }

    /**
     * Enables logging.
     *
     * @param value
     */
    public enableLogger(value: boolean): void {
        if (value) {
            amqp.log.transports.console.level = 'info'
            return
        }
        amqp.log.transports.console.level = 'none'
    }
}
