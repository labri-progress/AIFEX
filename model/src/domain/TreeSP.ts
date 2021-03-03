import Ngram from "./Ngram";
import Note from "./Note";
import NoteDistribution from "./NoteDistribution";
import Stimulus from "./Stimulus";

export default class TreeSP {
    private _stimulus: Stimulus;
    private _suffixMap: Map<string, TreeSP>;
    private _successorStimulusMap: Map<string, number>;
    private _successorNoteMap: Map<string, number>;

    constructor(stimulus: Stimulus) {
        if (stimulus === null || stimulus === undefined) {
            throw new Error("Cannot create Tree with no stimulus");
        }
        this._stimulus = stimulus;
        this._suffixMap = new Map(); // <Stimulus,Tree>
        this._successorStimulusMap = new Map(); // <Stimulus,Number>
        this._successorNoteMap = new Map(); // <Note,Number>
    }

    get stimulus(): Stimulus {
        return this._stimulus;
    }

    public hasSuccessor(stimulus: Stimulus): boolean {
        return this._suffixMap.has(stimulus.value)
    }

    public getAllNgram(): Ngram[] {
        let ngrams: Ngram[] = [];
        this.getAllNgramsRec([], ngrams)

        return ngrams;
    }

    private getAllNgramsRec(path: Stimulus[], returnArray: Ngram[]): Ngram[] {
        for (const [key, occurence] of this._successorStimulusMap) {
            const successor = new Stimulus(key);
            const ngram = new Ngram([...path, successor], occurence)
            returnArray.push(ngram);
        }
        for (const [key, suffix] of this._suffixMap) {
            let pathCpy = path.slice()
            pathCpy.push(new Stimulus(key));
            suffix.getAllNgramsRec(pathCpy, returnArray);
        }
        return returnArray;
    }

    public successorOccurs(context: Stimulus[]): void {
        if (context.length === 0) {
            return;
        }
        if (context.length === 1) {
            const stimulus = context[0];
            let successorOccurence = this._successorStimulusMap.get(stimulus.value);
            if (! successorOccurence) {
                successorOccurence = 1;
            } else {
                successorOccurence++;
            }
            this._successorStimulusMap.set(stimulus.value, successorOccurence);
        } else {
            const first = context[0]
            const successorTree = this._suffixMap.get(first.value);
            if (successorTree) {
                successorTree.successorOccurs(context.slice(1, context.length));
            }
        }
    }


    public learnContext(context: Stimulus[]): void {
        if (context.length === 0) {
            return;
        }
        const successor = context[0];
        
        if (!this._successorStimulusMap.has(successor.value)) {
            this._successorStimulusMap.set(successor.value, 0);
            if (!this._suffixMap.has(successor.value)) {
                this._suffixMap.set(successor.value, new TreeSP(successor))
            }
        }

        if (context.length >= 2) {
            const suffixContext = context.slice(1, context.length);
            let tree = this._suffixMap.get(successor.value)
            if (!tree) {
                tree = new TreeSP(successor);
            }
            tree.learnContext(suffixContext);
        }
    }

    public learnNoteKnowingContext(note: Note, context: Stimulus[]): void {
        if (context.length === 0) {
            let successorOccurence = this._successorNoteMap.get(note.value)
            if (successorOccurence === undefined) {
                successorOccurence = 1;
            } else {
                successorOccurence++;
            }
            this._successorNoteMap.set(note.value, successorOccurence);
            return;
        } else {
            const successor = context[0];
            if (!this._suffixMap.has(successor.value)) {
                const prefixTree = new TreeSP(successor);
                this._suffixMap.set(successor.value, prefixTree);
            }
            const suffixContext = context.slice(1, context.length);
            this._suffixMap.get(successor.value)?.learnNoteKnowingContext(note, suffixContext);
        }
    }

    public getProbabilityMap(context: Stimulus[]): Map<string, number> {
        let probabilityMap = new Map();

        if (context.length === 0) {
            let totalOcc = 0;
            for (const occurence of this._successorStimulusMap.values()) {
                totalOcc += occurence
            }
            for (const [stimulusValue, occurence] of this._successorStimulusMap) {
                probabilityMap.set(stimulusValue, occurence / totalOcc);
            }
            return probabilityMap;
        } else {
            const suffixContext = context.slice(1, context.length);
            let tree = this._suffixMap.get(context[0].value)
            if (!tree) {
                return probabilityMap;
            } else {
                return tree.getProbabilityMap(suffixContext);
            }
        }
    }

    public getNoteDistributionsFromPrefixes(context: Stimulus[]): Map<string, NoteDistribution> {
        return this.getNoteDistributionRec(context, context)
    }

    private getNoteDistributionRec(context: Stimulus[], contextIt: Stimulus[]): Map<string, NoteDistribution> {

        if (contextIt.length > 0) {
            const contextCopy = contextIt.slice();
            const next = contextCopy.shift();
            if (next === undefined) {
                return new Map();
            }
            const suffix = this._suffixMap.get(next.value);
            if (!suffix) {
                return new Map();
            }
            return suffix.getNoteDistributionRec(context, contextCopy);
        } else {
            const distributionMap: Map<string, NoteDistribution> = new Map();
            for (const [key, occurence] of this._successorNoteMap) {
                let noteDistribution;
                if (occurence === undefined) {
                    noteDistribution = new NoteDistribution(new Note(key), context.slice(), 0, 0);
                } else {
                    noteDistribution = new NoteDistribution(new Note(key), context.slice(), occurence, 0);
                }
                distributionMap.set(key, noteDistribution);
            }
            return distributionMap;
        }
    }

}
