import Comment from "./Comment";
import Interaction from "./Interaction";

// Value Object
export default class CommentInteraction extends Interaction {
    public readonly comment: Comment;

    constructor(index: number, comment: Comment) {
        super(index);
        this.comment = comment;
    }

    public toString(): string {
        if (this.comment.value) {
            return `${this.comment.kind}$${this.comment.value}`;
        } else {
            return this.comment.kind;
        }
    }
}
