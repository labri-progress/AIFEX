export default class Ngram {
    readonly key: string;
    readonly n: number;
    readonly occurence: number;
    readonly nextActions: {key: string, occurence: number}[];
    readonly nextObservations: {key: string, occurence: number}[];

    constructor(key: string, n: number, occurence: number, nextActions: {key: string, occurence: number}[], nextObservations: {key: string, occurence: number}[]) {
        this.key = key;
        this.n = n;
        this.occurence = occurence;
        this.nextActions = nextActions;
        this.nextObservations = nextObservations;
    }
}