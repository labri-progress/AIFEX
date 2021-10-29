import CommentDistribution from "./CommentDistribution";
import Action from "./Action";

export default class Comment {

    public type: string;
    public note: string;
    public distributionList: CommentDistribution[];

    constructor(type: string, note: string) {
        this.type = type;
        this.note = note;
        this.distributionList = [];
    }

    addDistribution(noteOccurence: number, contextOccurence: number, context: Action[]) : void{
        const distribution = new CommentDistribution(context, contextOccurence, noteOccurence);
        this.distributionList.push(distribution)
    }

    public toString(): string {
        return `${this.type}: ${this.note}`;
    }

    static parseComment(commentText: string): Comment {
        const parts = commentText.split("$");
        if (parts.length === 2) {
            return new Comment(parts[0], parts[1]);
        } else {
            throw new Error("Failed to parse comment : " + commentText);
        }
    }

}