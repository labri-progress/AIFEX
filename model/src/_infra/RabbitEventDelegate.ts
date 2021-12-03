
import amqp = require('amqplib');
import config from "./config";
import Note from "../domain/Note";
import Sequence from "../domain/Sequence";
import Stimulus from "../domain/Stimulus";

const QUEUE_NAME = 'aifex-session';

export default class RabbitDelegate {
    public subscribers: any[];
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;


    constructor() {
        this.subscribers = [];
        amqp.connect(`amqp://${config.rabbitmq}`)
            .then((conn) => {
                this.connection = conn;
                return this.connection.createChannel();
            })
            .then((channel) => {
                this.channel = channel;
                return channel.assertQueue(QUEUE_NAME, { durable: false });
            })
            .then((ok) => {
                if (this.channel) {
                    this.channel.consume(QUEUE_NAME, message => {
                        if (message !== null) {
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
                                                } else if (interaction.concreteType === "Comment") {
                                                    seq.addNote(new Note(value));
                                                }
                                            });
                                            subscriber.hasNewSequence(data.sessionId, seq);
                                            break;
                                        }
                                        default:
                                            break;
                                    }
                                } catch (e) {
                                    console.log('message problem: ', message);
                                    console.log('error: ', e);
                                }
                            });
                        }

                    })
                }
            });

    }

    public subscribe(subscriber: any): void {
        this.subscribers.push(subscriber);
    }
}

