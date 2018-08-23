import { Configuration } from "./rabbitmq.config"
import { Activity, IActivity } from "./../../models/activity"
import { ActivityRepository } from "./../../repositories/activity.repository"
import { IExceptionError, ApiException } from "./../../exceptions/api.exception"
import amqp from "amqplib/callback_api"


/**
 * This class is responsible for subscribing the application to 
 * an instance of RabbitMQ, to consume the data provided and store it 
 * in the database.
 */
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
    private static q: any = "activityQueue"

    /**
     * Empty constructor, responsible only for setting the repository value.
     */
    constructor() {
        RabbitMQSubscriber.repository = new ActivityRepository(this.ActivityModel)
    }

    /**
     * Method used to start the connection to the RabbitMQ instance.
     * @returns any. In this implementation, the method does not return any 
     * type of information, it only prints in the console in case there is 
     * some connection error with the instance.
     */
    public static startReceive(): any {
        /**
         * Connect with the RabbitMQ instance.
         */
        amqp.connect(Configuration.url, (err, conn) => {
            if (err) console.log("[AMQP ERROR CONNECT]", err)
            /**
             * Assigns the connection to the variable 'amqpConn'.
             */
            RabbitMQSubscriber.amqpConn = conn
            RabbitMQSubscriber.consumer()
        })
    }

    /**
     * Start consume the activity tracking in a determinated queue. In this
     * implementation, the method does not return any type of information,
     * it only prints in the console in case there is some subscribe error
     * with the instance.
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
                if (err) console.log("[AMQP ERROR SUBSCRIBE]", err)
                /**
                 *  Confirm the queue to receive data.
                 */
                ch.assertQueue(RabbitMQSubscriber.q, {durable: false})
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

                        /**
                         * Saves the data consumed in the local database. If successful, a 
                         * successful message will appear. Otherwise, a message will appear 
                         * stating that there was an error during the process, in addition to 
                         * the description of the error, following the implementation pattern.
                         */
                        RabbitMQSubscriber.repository.save(activity)
                            .then((result: IActivity) => {
                                if (result) console.log("[DATA SAVED SUCESSFULLY]")
                            }).catch(err => {
                                console.log("[ERROR SAVING DATA]", new ApiException(err.code, err.message))
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
