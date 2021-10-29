import Note from "./Note";
import Stimulus from "./Stimulus";

export default class Sequence {
    private _sequence: Array<Stimulus | Note>;

    constructor(sequence: Array<Stimulus | Note> = []) {
        this._sequence = sequence;
    }

    get length(): number {
        return this._sequence.length;
    }

    public addStimulus(stimulus: Stimulus): void {
        this._sequence.push(stimulus);
    }

    public addNote(note: Note): void {
        this._sequence.push(note);
    }

    public getInteractions():(Stimulus|Note)[] {
        return this._sequence;
    }

    public getContext(): Stimulus[] {
        return this._sequence.filter( (element) => element instanceof Stimulus);
    }

    public getNotes(): Note[] {
        return this._sequence.filter( (element) => element instanceof Note);
    }

    public cloneAndPop(): [Sequence, Note | Stimulus | undefined] {
        if (this._sequence.length > 0 ) {
            const clone = new Sequence();
            clone._sequence = this._sequence.slice();
            const pop = clone._sequence.pop();
            return [clone, pop];
        } else {
            return [this, undefined];
        }
    }

    public cloneAndShift(): [Sequence, Note | Stimulus | undefined] {
        if (this._sequence.length > 0 ) {
            const clone = new Sequence();
            clone._sequence = this._sequence.slice();
            const first = clone._sequence.shift();
            return [clone, first];
        } else {
            return [this, undefined];
        }
    }

}
