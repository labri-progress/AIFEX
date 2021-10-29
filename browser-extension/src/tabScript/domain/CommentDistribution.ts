import Action from "./Action";

export default class CommentDistribution {

    actions: Action[];
    occurence: number;
    noteOccurence: number;

    constructor(actions : Action[] = [], occurence: number, noteOccurence: number) {
        this.actions = actions
        this.occurence = occurence;
        this.noteOccurence = noteOccurence
    }

}