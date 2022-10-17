import Ngram from "./Ngram";
import Note from "./Note";
import NoteDistribution from "./NoteDistribution";
import Sequence from "./Sequence";
import Stimulus from "./Stimulus";
import Tree from "./TreeCSP";
import Model from "./Model";

export default class CSPModel extends Model  {

    private _treeMap: Map <string, Tree>;
    private readonly _interpolationfactor: number;

    constructor(depth: number, interpolationfactor: number= 2, id?: string) {
        super(depth, id)
        this._interpolationfactor = interpolationfactor;

        this._treeMap = new Map();
    }

    get interpolationfactor(): number {
        return this._interpolationfactor;
    }

    // For testing purpose
    public getTreeByStimulus(stimulus: Stimulus): Tree | undefined {
        return this._treeMap.get(stimulus.value);
    }

    public learnSequence(sequence: Sequence): void {
        while (sequence.length > 0) {
            const context = this.fitContextToDepth(sequence.getContext());
            if (context.length === 0) {
                return;
            }
            const [prefix, last] = sequence.cloneAndPop();
            if (last instanceof Note) {
                this.addNoteKnowingContext(last, this.fitContextToDepth(prefix.getContext()));
            } else if (last instanceof Stimulus) {
                this.contextOccurs(context);
                this.addStimulusKnowingContext(last, this.fitContextToDepth(prefix.getContext()));
            }
            sequence = prefix;
        }
    }

    public learnNewStimulusAndNotesInSequence(sequence: Sequence, newStimulusAndNotes: Array<Stimulus|Note>): void  {
        if (newStimulusAndNotes.length === 0) {
            this.learnSequence(sequence);
        } else {
            let prefix = sequence.getInteractions().slice(0, sequence.length - newStimulusAndNotes.length);
            let prefixContext = this.fitContextToDepth(prefix);
            newStimulusAndNotes.forEach((stimulusOrNote) => {
                if (stimulusOrNote instanceof Stimulus) {
                    this.contextOccurs(this.fitContextToDepth(prefixContext.concat(stimulusOrNote)));
                    this.addStimulusKnowingContext(stimulusOrNote, prefixContext);
                    prefixContext = this.fitContextToDepth(prefixContext.concat([stimulusOrNote]));
                } else if (stimulusOrNote instanceof Note) {
                    this.addNoteKnowingContext(stimulusOrNote, prefixContext);
                }
            });
        }

    }

    public getNoteDistributionListMap(sequence: Sequence): Map<string, NoteDistribution[]> {
        if (sequence.length === 0) {
            throw new Error("cannot getNoteDistributionListMap, sequence's context is empty");
        }
        let context = sequence.getContext();
        const lastStimulusdOfContext = context[context.length - 1];

        const distributionListMap: Map<string, NoteDistribution[]> = new Map();
        if (!this._treeMap.has(lastStimulusdOfContext.value)) {
            return distributionListMap;
        }

        while (context.length > 0) {
            const tree = this._treeMap.get(lastStimulusdOfContext.value);
            if (tree !== undefined) {
                const distributionForContext: Map<string, NoteDistribution> = tree.getNoteDistributionsFromPrefixes(context);
                distributionForContext.forEach((distribution, note) => {
                    let distributions = distributionListMap.get(note);
                    if (!distributions) {
                        distributions = [];
                        distributionListMap.set(note, distributions);
                    }
                    distributions.push(distribution);
                });
            }
            context = context.slice(1, context.length);
        }
        return distributionListMap;
    }

    public getStimulusProbabilityMap(sequence: Sequence): Map<string, number> {
        const context = sequence.getContext()
        if (context.length === 0) {
            throw new Error("cannot getStimulusProbabilityMap, sequence's context is empty");
        }
        const lastStimulusdOfContext = context[context.length - 1];
        if (! this._treeMap.has(lastStimulusdOfContext.value)) {
            return new Map();
        } else {
            const tree = this._treeMap.get(lastStimulusdOfContext.value);
            if (! tree) {
                return new Map();
            } else {
                return tree.getStimulusInterpolatedProbabilityMap(context, this.interpolationfactor);
            }
        }
    }

    public getAllNgram(): Ngram[] {
        const ngrams : Ngram[] = [];
        for (const tree of this._treeMap.values()) {
            tree.getAllNgram().forEach( (ngram) => {
                ngrams.push(ngram);
            });
        }
        return ngrams;
    }

    private contextOccurs(context: Stimulus[]): void {
        const lastStimulusOfContext = context[context.length - 1];
        const tree = this.findTreeByStimulus(lastStimulusOfContext);
        tree.contextOccurs(context);
    }

    private addStimulusKnowingContext(stimulus: Stimulus, context: Stimulus[]): void {
        if (context.length !== 0) {
            const lastStimulusOfSequence = context[context.length - 1];
            const tree = this.findTreeByStimulus(lastStimulusOfSequence);
            tree.learnStimulusKnowingContext(stimulus, context);
        }
    }

    private addNoteKnowingContext(note: Note, context: Stimulus[]): void {
        if (context.length === 0) { return; }
        const lastStimulusOfSequence = context[context.length - 1];
        const tree = this.findTreeByStimulus(lastStimulusOfSequence);
        tree.learnNoteKnowingContext(note, context);
    }

    private findTreeByStimulus(stimulus: Stimulus): Tree {
        let tree = this._treeMap.get(stimulus.value);
        if (!tree) {
            tree = new Tree(stimulus);
            this._treeMap.set(stimulus.value, tree);
        }
        return tree;
    }

}