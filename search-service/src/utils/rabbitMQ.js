import amqp from 'amqplib';
import logger from './logger.js'

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events'

async function connectRabbitmq() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", {durable: false});
        logger.info("connected to rabbitMQ")
    } catch (error) {
        logger.error("error connecting RabbitMQ",error)
    }
}

async function publishEvent(routingKey, message){
        if(!channel){
            await connectRabbitmq();
        }

        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))
        logger.info(`Event published ${routingKey}`)
}

async function consumeEvent(routingKey, callback){
    if(!channel){
        await connectRabbitmq();
    }


    const q = await channel.assertQueue("", {exclusive: true});
    await channel.bindQueue(q.queue,EXCHANGE_NAME, routingKey);
    await channel.consume(q.queue, (msg) => {
        if(msg !== null){
            const content = JSON.stringify(msg.toString());
            callback(content);
            channel.ack();
        }

        logger.info(`subscribed to event successfully ${routingKey}`);
    })
}

export  {connectRabbitmq, publishEvent, consumeEvent};