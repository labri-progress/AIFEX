import Stimulus from "./Stimulus";
import NoteDistribution from "./NoteDistribution";
import Note from "./Note";

export default class ItemSet {
    public stimulusSet: Set<Stimulus>;
    public noteMap: Map<string, number>;
    public occurrence: number;
    public successorsMap: Map<string, ItemSet>;

    get size(): number {
        return this.stimulusSet.size;
    }

    get key(): string {
        return [...this.stimulusSet].map(stimulus => stimulus.value).join(' -> ')
    }

    get noteDistributions(): NoteDistribution[] {
        const noteDistributions = [];
        for (const [value, occurences] of this.noteMap) {
            noteDistributions.push(new NoteDistribution(new Note(value), [...this.stimulusSet], occurences, this.occurrence));
        }
        return noteDistributions;
    }

    constructor(stimulusList: Stimulus[], occurences: number = 0) {
        this.stimulusSet = new Set(stimulusList);
        this.noteMap = new Map();
        this.successorsMap = new Map();
        this.occurrence = occurences;
    }

    includes(itemSet: ItemSet): boolean {
        return [...itemSet.stimulusSet].every(item => this.stimulusSet.has(item))
    }

    addNote(note: Note): void {
        let occurences = this.noteMap.get(note.value)
        if (occurences) {
            this.noteMap.set(note.value, occurences + 1);
        } else {
            this.noteMap.set(note.value, 1);
        }
    }


    
}