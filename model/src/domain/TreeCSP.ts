import Ngram from "./Ngram";
import Note from "./Note";
import NoteDistribution from "./NoteDistribution";
import Stimulus from "./Stimulus";

export default class TreeCSP {
    private _stimulus: Stimulus;
    private _prefixMap: Map<string, TreeCSP>;
    private _stimulusSuccessorOccurence: number;
    private _occurence: number;
    private _successorStimulusMap: Map<string, number>;
    private _successorNoteMap: Map<string, number>;

    constructor(stimulus: Stimulus) {
        if (stimulus === null || stimulus === undefined) {
            throw new Error("Cannot create Tree with no stimulus");
        }
        this._occurence = 0;
        this._stimulus = stimulus;
        this._prefixMap = new Map(); // <Stimulus,Tree>
        this._stimulusSuccessorOccurence = 0;
        this._successorStimulusMap = new Map(); // <Stimulus,Number>
        this._successorNoteMap = new Map(); // <Note,Number>
    }

    get stimulus(): Stimulus {
        return this._stimulus;
    }

    get occurence(): number {
        return this._occurence;
    }

    get successorStimulusSet(): Stimulus[] {
        return [...this._successorStimulusMap.keys()].map((key) => new Stimulus(key));
    }

    get stimulusSuccessorOccurence(): number {
        return this._stimulusSuccessorOccurence;
    }

    public getSuccessorStimulusOccurence(stimulus: Stimulus): number | undefined{
        return this._successorStimulusMap.get(stimulus.value);
    }

    get successorNoteSet(): Note[] {
        return [...this._successorNoteMap.keys()].map((key) => new Note(key));
    }

    public getSuccessorNoteOccurence(note: Note): number | undefined{
        return this._successorNoteMap.get(note.value);
    }

    get prefixStimulusSet(): Stimulus[] {
        return [...this._prefixMap.keys()].map( (key) => new Stimulus(key));
    }

    // for testing purpose only !
    public getPrefixTreeByStimulus(stimulus: Stimulus): TreeCSP | undefined{
        return this._prefixMap.get(stimulus.value);
    }

    public getAllNgram(): Ngram[] {
        const ngramSet: Ngram[] = [];
        for (const tree of this._prefixMap.values()) {
            const subNgramSet = tree.getAllNgram();
            subNgramSet.forEach((subNgram) => {
                const stimulusSet = subNgram.ngram;
                stimulusSet.push(this.stimulus);
                const ngram = new Ngram(stimulusSet, subNgram.occurence);
                for (const [key, occurence] of subNgram.successorStimulus.entries()) {
                    ngram.addSuccessorStimulus(new Stimulus(key), occurence);
                }
                for (const [key, occurence] of subNgram.successorNote.entries()) {
                    ngram.addSuccessorNote(new Note(key), occurence);
                }
                ngramSet.push(ngram);
            });
        }
        const ngram = new Ngram([this._stimulus], this._occurence);
        for (const [key, occurence] of this._successorStimulusMap.entries()) {
            ngram.addSuccessorStimulus(new Stimulus(key), occurence);
        }
        for (const [key, occurence] of this._successorNoteMap.entries()) {
            ngram.addSuccessorNote(new Note(key), occurence);
        }
        ngramSet.push(ngram);
        return ngramSet;
    }

    public contextOccurs(context: Stimulus[]): void {
        if (context.length === 0) {
            return;
        }
        const lastStimulus = context[context.length - 1];
        if (lastStimulus.value !== this._stimulus.value) {
            return;
        }

        this._occurence++;

        if (context.length > 1) {
            const prefixContext = context.slice(0, context.length - 1);
            const lastStimulusOfPrefixContext = prefixContext[prefixContext.length - 1];
            if (!this._prefixMap.has(lastStimulusOfPrefixContext.value)) {
                const prefixTree = new TreeCSP(lastStimulusOfPrefixContext);
                this._prefixMap.set(lastStimulusOfPrefixContext.value, prefixTree);
            }
            this._prefixMap.get(lastStimulusOfPrefixContext.value)?.contextOccurs(prefixContext);
        }

    }

    public addSuccessorStimulus(stimulus: Stimulus): void {
        if (this._successorStimulusMap.has(stimulus.value)) {
            let occurenceSuccessorStimulus = this._successorStimulusMap.get(stimulus.value);
            if (occurenceSuccessorStimulus !== undefined) {
                occurenceSuccessorStimulus++;
                this._successorStimulusMap.set(stimulus.value, occurenceSuccessorStimulus);
            } 
        } else {
            this._successorStimulusMap.set(stimulus.value, 1);
        }
        this._stimulusSuccessorOccurence++;
    }

    public addSuccessorNote(note: Note): void {
        if (this._successorNoteMap.has(note.value)) {
            let occurenceSuccessorNote = this._successorNoteMap.get(note.value);
            if (occurenceSuccessorNote !== undefined) {
                occurenceSuccessorNote++;
                this._successorNoteMap.set(note.value, occurenceSuccessorNote);
            }
        } else {
            this._successorNoteMap.set(note.value, 1);
        }
    }

    public learnStimulusKnowingContext(stimulus: Stimulus, context: Stimulus[]): void {
        if (context.length === 0) {
            return;
        }

        const lastStimulus = context[context.length - 1];
        if (lastStimulus.value !== this._stimulus.value) {
            return;
        }

        this.addSuccessorStimulus(stimulus);

        if (context.length > 1) {
            const prefixContext = context.slice(0, context.length - 1);
            const lastStimulusOfPrefixContext = prefixContext[prefixContext.length - 1];
            if (!this._prefixMap.has(lastStimulusOfPrefixContext.value)) {
                const prefixTree = new TreeCSP(lastStimulusOfPrefixContext);
                this._prefixMap.set(lastStimulusOfPrefixContext.value, prefixTree);
            }
            this._prefixMap.get(lastStimulusOfPrefixContext.value)?.learnStimulusKnowingContext(stimulus, prefixContext);
        }
    }

    public learnNoteKnowingContext(note: Note, context: Stimulus[]): void {
        if (context.length === 0) {
            return;
        }

        const lastStimulus = context[context.length - 1];
        if (lastStimulus.value !== this._stimulus.value) {
            return;
        }

        this.addSuccessorNote(note);

        if (context.length > 1) {
            const prefixContext = context.slice(0, context.length - 1);
            const lastStimulusOfPrefixContext = prefixContext[prefixContext.length - 1];
            if (!this._prefixMap.has(lastStimulusOfPrefixContext.value)) {
                const prefixTree = new TreeCSP(lastStimulusOfPrefixContext);
                this._prefixMap.set(lastStimulusOfPrefixContext.value, prefixTree);
            }
            this._prefixMap.get(lastStimulusOfPrefixContext.value)?.learnNoteKnowingContext(note, prefixContext);
        }

    }

    public getStimulusProbability(stimulus: Stimulus, context: Stimulus[]): number {
        if (context.length === 0) {
            return 0;
        }
        const lastStimulus = context[context.length - 1];
        if (lastStimulus.value !== this._stimulus.value) {
            return 0;
        }
        if (!this._successorStimulusMap.has(stimulus.value)) {
            return 0;
        }
        if (context.length === 1 ) {
            let succOccurences = this._successorStimulusMap.get(stimulus.value);
            if (succOccurences === undefined) {
                return 0;
            } else {
                return succOccurences / this._stimulusSuccessorOccurence;
            }
        } else {
            const prefixStimulus = context[context.length - 2];
            const prefixContext = context.slice(0, context.length - 1);
            const prefix = this._prefixMap.get(prefixStimulus.value);
            if (! prefix) {
                return 0;
            } else {
                return prefix.getStimulusProbability(stimulus, prefixContext);

            }
        }
    }

    public getStimulusProbabilityList(stimulus: Stimulus, context: Stimulus[]): number[] {
        const list : number[] = [];
        if (context.length === 0 ) {
            return list;
        }
        if (context[context.length - 1].value !== this._stimulus.value) {
            return list;
        }

        const occStimulus = this._successorStimulusMap.get(stimulus.value);
        if (occStimulus === undefined || occStimulus === 0 ) {
            list.push(0);
        } else {
            list.push(occStimulus / this._stimulusSuccessorOccurence);
        }

        if (context.length > 1) {
            const lastStimulus = context[context.length - 2];

            if (this._prefixMap.has(lastStimulus.value)) {
                const prefix = this._prefixMap.get(lastStimulus.value);
                if (prefix !== undefined) {
                    list.push(...prefix.getStimulusProbabilityList(stimulus, context.slice(0, context.length - 1)));
                }
            }
        }

        return list;
    }

    public getStimulusInterpolatedProbabilityMap(context: Stimulus[], factor: number): Map<string, number> {
        const interpolatedProbabilityMap = new Map();
        if (context.length === 0) {
            return interpolatedProbabilityMap;
        }
        const lastStimulus = context[context.length - 1];

        if (lastStimulus.value !== this._stimulus.value) {
            return interpolatedProbabilityMap;
        }
        let sumProba = 0;

        for (const key of Array.from(this._successorStimulusMap.keys())) {
            const keyProbaList = this.getStimulusProbabilityList(new Stimulus(key), context);

            const keyProba = keyProbaList.reduce( (pre, cur, index) => {
                return pre + cur * Math.pow(factor, index);
            }, 0);

            interpolatedProbabilityMap.set(key, keyProba);

            sumProba += keyProba;
        }
        for (const key of Array.from(interpolatedProbabilityMap.keys())) {
            const interProba = interpolatedProbabilityMap.get(key) / sumProba;
            interpolatedProbabilityMap.set(key, interProba);
        }
        return interpolatedProbabilityMap;
    }

    public getNoteDistributionsFromPrefixes(context: Stimulus[]): Map<string, NoteDistribution> {
        if (context.length === 0) {
            return new Map();
        }
        const distributionMap: Map<string, NoteDistribution> = new Map();
        const lastStimulus = context[context.length - 1];
        const prefixContext = context.slice(0, context.length - 1);

        if (lastStimulus.value !== this._stimulus.value) {
            return distributionMap;
        }

        for (const key of Array.from(this._successorNoteMap.keys())) {
            const noteDistribution = this.getNoteDistribution(new Note(key), context, prefixContext);
            if (noteDistribution !== undefined) {
                distributionMap.set(key, noteDistribution);
            }
        }
        return distributionMap;
    }

    private getNoteDistribution(note: Note, context: Stimulus[], prefixesIterator: Stimulus[]): NoteDistribution | undefined{
        if (prefixesIterator.length === 0) {
            const occurenceNote = this._successorNoteMap.get(note.value);
            const contextOccurence = this._occurence;

            if (occurenceNote === undefined ) {
                return new NoteDistribution(note, context, 0, contextOccurence);
            } else {
                return new NoteDistribution(note, context, occurenceNote, contextOccurence);
            }
        }
        const prefix = prefixesIterator[prefixesIterator.length - 1];
        const newIteration = prefixesIterator.slice(0, prefixesIterator.length - 1);

        if (!this._prefixMap.has(prefix.value)) {
            return;
        } else {
            return this._prefixMap.get(prefix.value)?.getNoteDistribution(note, context, newIteration);
        }
    }

}