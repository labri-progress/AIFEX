import Comment from "./Comment";
import Interaction from "./Interaction";

export default class CommentInteraction extends Interaction {
    public readonly comment: Comment;

    constructor(index: number, comment: Comment, date?: Date) {
        super(index, date);
        this.comment = comment;
    }
}
