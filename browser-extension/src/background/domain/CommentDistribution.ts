export default class CommentDistribution {

    private _comment: string;
    private _distributions : {
        commentOccurence: number,
        contextOccurece: number,
        context: string[]
    }[];

    constructor(comment: string, distributions : {
        commentOccurence: number,
        contextOccurece: number,
        context: string[]
    }[]) {
        this._comment = comment;
        this._distributions = distributions;
    }

    get comment() : string {
        return this._comment;
    }

    get distributions() : {
        commentOccurence: number,
        contextOccurece: number,
        context: string[]
    }[] {
        return this._distributions;
    }

}