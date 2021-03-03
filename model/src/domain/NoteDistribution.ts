import Note from "./Note";
import Stimulus from "./Stimulus";

export default class NoteDistribution {

    // Number of time a note has been added in this context
    private _noteOccurence: number;

    // Number of time the context has appeard
    private _contextOccurence: number;

    private _note: Note;

    private _context: Stimulus[];

    constructor(note: Note, context: Stimulus[], noteOccurence: number, contextOccurence: number) {
        if (note === null || note === undefined) {
            throw new Error("Cannot create NoteDistribution with no note");
        }
        if (noteOccurence === null || noteOccurence === undefined) {
            throw new Error("Cannot create NoteDistribution with no noteOccurrence");
        }
        if (contextOccurence === null || contextOccurence === undefined) {
            throw new Error("Cannot create NoteDistribution with no contextOccurence");
        }
        this._note = note;
        this._context = context;
        this._noteOccurence = noteOccurence;
        this._contextOccurence = contextOccurence;
    }

    get note(): Note {
        return this._note;
    }

    get context(): Stimulus[] {
        return this._context;
    }

    get noteOccurence(): number {
        return this._noteOccurence;
    }

    get contextOccurence(): number {
        return this._contextOccurence;
    }

    get probability(): number {
        return this._noteOccurence / this._contextOccurence;
    }
}
