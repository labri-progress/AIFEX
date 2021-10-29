
import * as Amqp from "amqp-ts";
import config from "./config";
import Note from "../domain/Note";
import Sequence from "../domain/Sequence";
import Stimulus from "../domain/Stimulus";

export default class RabbitDelegate {
    public subscribers: any[];
    private readonly connection: Amqp.Connection;
    private readonly exchange: Amqp.Exchange;
    private readonly queue: Amqp.Queue;


    constructor() {
        this.subscribers = [];
        this.connection = new Amqp.Connection(`amqp://${config.rabbitmq}`);
        this.exchange = this.connection.declareExchange("aifex");
        this.queue = this.connection.declareQueue("session");
        this.queue.bind(this.exchange);

        this.queue.activateConsumer( message => {
            this.subscribers.forEach((subscriber) => {
                try {
                    const data = message.getContent();

                    switch (data.kind) {
                        case "exploration": {
                            const exploration = data.exploration;
                            const seq = new Sequence();
                            exploration.forEach((interaction : any) => {
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
                    console.log('message problem: ',message);
                    console.log('error: ',e);
                }
            });

        })
    }

    public subscribe(subscriber : any): void {
        this.subscribers.push(subscriber);
    }
}

