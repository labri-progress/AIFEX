import amqp = require('amqplib');
import EventStore from "../application/EventStore";
import config from "./config";
import ActionInteraction from "../domain/ActionInteraction";
import AnswerInteraction from "../domain/AnswerInteraction";
import CommentInteraction from "../domain/CommentInteraction";
import Exploration from "../domain/Exploration";
import { logger } from '../logger';

const QUEUE_NAME = 'aifex-session';

export default class EventStoreRabbit implements EventStore {
    private connection: amqp.Connection | undefined;
    private channel : amqp.Channel | undefined;

    constructor() {
        this.connect()
    }

    connect() {
        logger.debug(`Starting Rabbit MQ connection : amqp://${config.rabbitmq}`);

        amqp.connect(`amqp://${config.rabbitmq}`)
            .then((conn) => {
                this.connection = conn;
                return this.connection.createChannel();
            })
            .then((channel) => {
                this.channel = channel;
                return channel.assertQueue(QUEUE_NAME, { durable: false });
            })
            .catch(error => {
                logger.error(error);
                setTimeout(this.connect.bind(this), 5000)
            })
    }

    public notifySessionExploration(sessionId: string, exploration: Exploration): Promise<void> {
        const sequence: {
            concreteType: string,
            kind: string,
            value: string | undefined,
        }[] = [];
        
        exploration.interactionList.forEach((interaction) => {
            if (interaction instanceof ActionInteraction) {
                sequence.push({
                    concreteType : "Action",
                    kind : interaction.action.prefix,
                    value : interaction.action.suffix,
                });
            }
            if (interaction instanceof CommentInteraction) {
                sequence.push({
                    concreteType : "Comment",
                    kind : interaction.comment.kind,
                    value : interaction.comment.value,
                });
            }
            if (interaction instanceof AnswerInteraction) {
                sequence.push({
                    concreteType : "Answer",
                    kind : interaction.answer.kind,
                    value : interaction.answer.value,
                });
            }
        });

        const msg = {
            exploration: sequence,
            kind: "exploration",
            sessionId,
            explorationNumber: exploration.explorationNumber,
            testerName: exploration.tester.name,
        };

        logger.debug(`Notifying session ${sessionId} of exploration ${exploration.explorationNumber}`);
        if (this.channel) {
            logger.debug(`Publishing message ${JSON.stringify(msg)}`);
            this.channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(msg)));   
        }

        return Promise.resolve();
    }
}
