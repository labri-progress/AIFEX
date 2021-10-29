import Note from "./Note";
import Stimulus from "./Stimulus";

export default class Ngram {
    private readonly _ngram: Stimulus[];
    private _occurence: number;
    private _successorStimulus: Map<string, number>;
    private _successorNote: Map<string, number>;

    constructor(ngram: Stimulus[], occurence: number) {
        if (ngram === null || ngram === undefined) {
            throw new Error("Cannot create Ngram with no array of stimulus");
        }
        if (! Array.isArray(ngram)) {
            throw new Error("Cannot create Ngram with no array of stimulus");
        }
        this._ngram = ngram;

        if (occurence === null || occurence === undefined) {
            throw new Error("Cannot create Ngram with no occurence");
        }
        this._occurence = occurence;
        this._successorStimulus = new Map();
        this._successorNote = new Map();
    }

    get n(): number {
        return this._ngram.length;
    }

    get key(): string {
        return this._ngram.map((stimulus) => stimulus.value).join(" -> ");
    }

    get ngram(): Stimulus[] {
        return [...this._ngram];
    }

    get occurence(): number {
        return this._occurence;
    }

    get successorStimulus(): Map<string, number> {
        return new Map(this._successorStimulus);
    }

    get successorNote(): Map<string, number> {
        return new Map(this._successorNote);
    }
    public addSuccessorStimulus(stimulus: Stimulus, occurence: number): void {
        this._successorStimulus.set(stimulus.value, occurence);
    }
    public addSuccessorNote(note: Note, occurence: number): void {
        this._successorNote.set(note.value, occurence);
    }
}
