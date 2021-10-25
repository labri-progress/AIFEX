
import * as Amqp from "amqp-ts";
import EventStore from "../application/EventStore";
import config from "./config";
import ActionInteraction from "../domain/ActionInteraction";
import AnswerInteraction from "../domain/AnswerInteraction";
import CommentInteraction from "../domain/CommentInteraction";
import Exploration from "../domain/Exploration";

export default class EventStoreRabbit implements EventStore {
    private readonly connection: Amqp.Connection;
    private readonly exchange: Amqp.Exchange;
    private readonly queue: Amqp.Queue;

    constructor() {
        this.connection = new Amqp.Connection(`amqp://${config.rabbitmq}`);
        this.exchange = this.connection.declareExchange("aifex");
        this.queue = this.connection.declareQueue("session");
        this.queue.bind(this.exchange);
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

        const msg: Amqp.Message = new Amqp.Message({
            exploration: sequence,
            kind: "exploration",
            sessionId,
            explorationNumber: exploration.explorationNumber,
            testerName: exploration.tester.name,
        });

        this.exchange.send(msg);

        return Promise.resolve();
    }
}
