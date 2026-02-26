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

async function consumeEvent(routingKey, callback){
    if(!channel){
        await connectRabbitmq();
    }

    const q = await channel.assertQueue("", {exclusive: true});
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if(msg !== null){
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    })

    logger.info(`Subscribed to event: ${routingKey}`);
}

export {connectRabbitmq, consumeEvent}