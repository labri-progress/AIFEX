export default class Ngram {
    readonly key: string;
    readonly n: number;
    readonly occurence: number;
    readonly nextActions: {key: string, occurence: number}[];
    readonly nextComments: {key: string, occurence: number}[];

    constructor(key: string, n: number, occurence: number, nextActions: {key: string, occurence: number}[], nextComments: {key: string, occurence: number}[]) {
        this.key = key;
        this.n = n;
        this.occurence = occurence;
        this.nextActions = nextActions;
        this.nextComments = nextComments;
    }
}