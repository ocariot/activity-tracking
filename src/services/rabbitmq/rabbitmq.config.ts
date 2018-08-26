/**
 * Configuration module to RabbitMQ with AMQP protocol.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */

 /**
 * Rabbit Config Module
 * 
 * This file can be used to enter the settings of the RabbitMQ instance that you want 
 * to publish or sign up to receive the notifications. You can change the file as you
 * wish.
 * 
 * For configuration, the only information you need is the 'AMQP URL', located in the 
 * RabbitMQ instance area. The url follows the following pattern:
 * 
 *      --  amqp://user:password@host/Vhost --, where:
 * 
 * 
 *  -> amqp:// = Protocol used to connect to the instance.
 *
 *  -> user: The user name defined in the instance.
 * 
 *  -> password: Password set on the instance.
 * 
 *  -> host: The host address defined in the instance.
 * 
 *  -> Vhost: The host path defined in the instance (Can be the same as user)
 * 
 */
 export class Configuration  {
    static url: string =  'amqp://vckrcjzy:gJkcqPKbr1jMORaHwLTyDYMKOI4Ul55N@lion.rmq.cloudamqp.com/vckrcjzy'
 }
