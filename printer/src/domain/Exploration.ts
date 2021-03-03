import Action from "./Action";
import ActionInteraction from "./ActionInteraction";
import Comment from "./Comment";
import CommentInteraction from "./CommentInteraction";
import Interaction from "./Interaction";

// Entity
export default class Exploration {
    private _isStopped: boolean;
    private _explorationNumber: number;
    private _interactionList: Interaction[];

    constructor(explorationNumber: number) {
        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create exploration, explorationNumber is null or undefined");
        }
        this._explorationNumber = explorationNumber;

        this._isStopped = false;
        this._interactionList = [];
    }

    public stop(): void {
        this._isStopped = true;
    }

    get isStopped(): boolean {
        return this._isStopped;
    }

    get explorationNumber(): number {
        return this._explorationNumber;
    }

    public addAction(action: Action): void {
        if (this.isStopped) {
            throw new Error("cannot add action to exploration, exploration is stopped");
        }
        this._interactionList.push(new ActionInteraction(this._interactionList.length, action));
    }

    public addComment(comment: Comment): void {
        if (this.isStopped) {
            throw new Error("cannot add comment to exploration, exploration is stopped");
        }
        this._interactionList.push(new CommentInteraction(this._interactionList.length, comment));
    }

    public addInteractionList(interactionList: Interaction[]): void {
        if (this.isStopped) {
            throw new Error("cannot add comment to exploration, exploration is stopped");
        }
        this._interactionList.push(...interactionList);
    }

    get interactionList(): Interaction[] {
        return this._interactionList.slice();
    }

}
