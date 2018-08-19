import { Configuration } from "./rabbitmq.config"
import { Activity, IActivity } from "./../../models/activity"
import { ActivityRepository } from "./../../repositories/activity.repository"
import { IExceptionError, ApiException } from "./../../exceptions/api.exception"
import amqp from "amqplib/callback_api"

export class RabbitMQSubscriber {
    static repository: ActivityRepository
    ActivityModel: any = Activity
    /**
     * Variable that will store the connection property.
     */
    private static amqpConn: any = null

    /**
     * Variable to define the queue to receive activity tracking data.
     */
    private static q: any = "activities"

    /**
     * Empty constructor.
     */
    constructor() {
        RabbitMQSubscriber.repository = new ActivityRepository(this.ActivityModel)
    }

    /**
     * Method used to start the connection to the RabbitMQ instance.
     * @returns any
     */
    public static startReceive(): any {
        /**
         * Connect with the RabbitMQ instance.
         */
        amqp.connect(Configuration.url, (err, conn) => {
            if (err) console.log("err", err)
            /**
             * Assigns the connection to the variable 'amqpConn'.
             */
            RabbitMQSubscriber.amqpConn = conn
            RabbitMQSubscriber.consumer()
        })
    }

    /**
     * Start consume the activity tracking in a determinated queue.
     */
    private static consumer(): any {
        /**
         * If has connection.
         */
        if (RabbitMQSubscriber.amqpConn) {
            /**
             * Create a new channel to receive user information.
             */
            RabbitMQSubscriber.amqpConn.createChannel(on_open)
            /**
             * Receives the channel that will be queued.
             */
            function on_open(err, ch) {
                if (err) console.log("err", err)
                /**
                 *  Confirm the queue to receive data.
                 */
                ch.assertQueue(RabbitMQSubscriber.q)
                /**
                 * Consumes data queued in queue 'users'.
                 */
                ch.consume(RabbitMQSubscriber.q, (activity) => {
                    /**
                     *  If message is not null
                     */
                    if (activity) {
                        /**
                         * Convert the received JSON file as a string to its original format
                         */
                        var activity = JSON.parse(activity.content.toString())

                        RabbitMQSubscriber.repository.save(activity)
                            .then((result: IActivity) => {
                                if (result) console.log(result)
                            }).catch(err => {
                                console.log(new ApiException(err.code, err.message))
                            })
                    }
                },
                    { noAck: true }
                )
            }
        }
    }

    /**
     * End connection with RabbitMQ instance.
     */
    private static endConnection(): any {
        if (this.amqpConn) {
            this.amqpConn.close()
        }
    }
}
