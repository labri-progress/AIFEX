
import amqp = require('amqplib');
import config from "./config";
import Note from "../domain/Note";
import Sequence from "../domain/Sequence";
import Stimulus from "../domain/Stimulus";
import { logger } from '../logger';

const QUEUE_NAME = 'aifex-session';

export default class RabbitDelegate {
    public subscribers: any[];
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;

    constructor() {
        this.subscribers = [];
        this.connect()
    }

    connect() {
        logger.debug(`Starting Rabbit MQ connection : amqp://${config.rabbitmq}`);
        amqp.connect(`amqp://${config.rabbitmq}`)
        .then((conn) => {
            logger.info('connected to RabbitMQ');
            this.connection = conn;
            return this.connection.createChannel();
        })
        .then((channel) => {
            this.channel = channel;
            return channel.assertQueue(QUEUE_NAME, { durable: false });
        })
        .then(() => {
            if (this.channel) {
                return this.channel.consume(QUEUE_NAME, message => {
                    logger.debug(`Received message`);
                    if (message !== null) {
                        logger.debug(`Message: ${message.content.toString()}`);
                        this.subscribers.forEach((subscriber) => {
                            try {
                                const data = JSON.parse(message.content.toString());

                                switch (data.kind) {
                                    case "exploration": {
                                        const exploration = data.exploration;
                                        const seq = new Sequence();
                                        exploration.forEach((interaction: any) => {
                                            let value = interaction.kind;
                                            if (interaction.value !== undefined) {
                                                value = value + "$" + interaction.value;
                                            }
                                            if (interaction.concreteType === "Action") {
                                                seq.addStimulus(new Stimulus(value));
                                            } else if (interaction.concreteType === "Observation") {
                                                seq.addNote(new Note(value));
                                            }
                                        });
                                        logger.debug(`Received sequence: ${JSON.stringify(seq)}`);
                                        subscriber.hasNewSequence(data.sessionId, seq);
                                        break;
                                    }
                                    default:
                                        break;
                                }
                            }
                            catch (e) {
                                console.log('message problem: ', message);
                                console.log('error: ', e);
                            }
                        })
                    }
                
                })
            }
        })
        .catch((error) => {
            logger.error(error);
            setTimeout(this.connect.bind(this), 5000)
        })

    }

    public subscribe(subscriber: any): void {
        this.subscribers.push(subscriber);
    }
}

