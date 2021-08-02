import Action from "./Action";
import ActionInteraction from "./ActionInteraction";
import Comment from "./Comment";
import CommentInteraction from "./CommentInteraction";
import Interaction from "./Interaction";
import Tester from "./Tester";

export default class Exploration {
    readonly tester: Tester;
    readonly isStopped: boolean;
    readonly explorationNumber: number;
    interactionList: Interaction[];
    readonly startDate : Date;
    readonly stopDate : Date | undefined;

    constructor(tester: Tester, explorationNumber: number, startDate?:Date) {
        this.tester = tester;
        if (startDate) {
            this.startDate = startDate;
        } else {
            this.startDate = new Date();
        }

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create exploration, explorationNumber is null or undefined");
        }
        this.explorationNumber = explorationNumber;

        this.isStopped = false;
        this.interactionList = [];
    }


    public addAction(action: Action): void {
        if (this.isStopped) {
            throw new Error("cannot add action to exploration, exploration is stopped");
        }
        this.interactionList.push(new ActionInteraction(this.interactionList.length, action));
    }

    public addComment(comment: Comment): void {
        if (this.isStopped) {
            throw new Error("cannot add comment to exploration, exploration is stopped");
        }
        this.interactionList.push(new CommentInteraction(this.interactionList.length, comment));
    }

    public addInteractionList(interactionList: Interaction[]): void {
        if (this.isStopped) {
            throw new Error("cannot add comment to exploration, exploration is stopped");
        }
        this.interactionList.push(...interactionList);
    }


}
