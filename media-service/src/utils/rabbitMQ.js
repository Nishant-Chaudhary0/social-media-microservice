import amqp from 'amqplib';
import logger from './logger.js';

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events";

async function connectRabbitmq(){
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel()

        await channel.assertExchange(EXCHANGE_NAME, "topic", {durable: false})
        logger.info("connected to rabbitMQ");
    } catch (error) {
     logger.error("error connecting to rabbitMQ");   
    }
}

