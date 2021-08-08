export default class CommentDistribution {

    //sequence of actions
    readonly context: string[];

    // Number of time a comment has been added in this context
    readonly commentOccurence: number;

    // Number of time the context has appeard
    readonly contextOccurence: number;


    constructor(context: string[], commentOccurence: number, contextOccurence: number) {
        this.context = context;
        this.commentOccurence = commentOccurence;
        this.contextOccurence = contextOccurence;
    }

}
