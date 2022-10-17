import Sequence from "./Sequence";
import NoteDistribution from "./NoteDistribution";
import Stimulus from "./Stimulus";
import Model from "./Model";
import Ngram from "./Ngram";
import Note from "./Note";
import TreeSP from "./TreeSP";


export default class SPModel extends Model {
    
    private _treeRoot: TreeSP;

    constructor(depth: number, id?: string) {
        super(depth, id)
        this._treeRoot = new TreeSP(new Stimulus("root"));
    }

    public learnSequence(sequence: Sequence): void {
        if (sequence.length <= 0) {
            return;
        }
        
        const combinations = interactionCombinations(sequence.getInteractions(), Math.min(this.depth, sequence.length))
        combinations.forEach(interactions => {
            let subSequence = new Sequence(interactions)
            while (subSequence.length > 0) {
                const context = this.fitContextToDepth(subSequence.getContext());
                if (context.length === 0) {
                    return;
                }
                let interactions = subSequence.getInteractions();
                this._treeRoot.learnContext(context);
                
                const first = interactions[0];
                interactions = interactions.slice(1, interactions.length)
                while(interactions.length > 0 && interactions[0] instanceof Note) {
                    const note = interactions[0];
                    this._treeRoot.learnNoteKnowingContext(note, context);
                    interactions = interactions.slice(1, interactions.length)
                }
                subSequence = subSequence.cloneAndShift()[0];
            }
            this._treeRoot.successorOccurs(interactions);
        });
    }

    public learnNewStimulusAndNotesInSequence(sequence: Sequence, newStimulusAndNotes: Array<Stimulus|Note>): void  {
        if (newStimulusAndNotes.length === 0) {
            this.learnSequence(sequence);
        } else {
            //TODO
            throw new Error("Method not implemented.");
        }
    }

    public getNoteDistributionListMap(sequence: Sequence): Map<string, NoteDistribution[]> {
       if (sequence.length === 0) {
            throw new Error("cannot getNoteDistributionListMap, sequence's context is empty");
        }
        let context = sequence.getContext();
        const distributionListMap: Map<string, NoteDistribution[]> = new Map();

        while(context.length > 0) {
            const distributionForContext: Map<string, NoteDistribution> = this._treeRoot.getNoteDistributionsFromPrefixes(context);
            distributionForContext.forEach((distribution, note) => {
                let noteDistributions = distributionListMap.get(note);
                if (!noteDistributions) {
                    noteDistributions = [];
                    distributionListMap.set(note, noteDistributions);
                }
                noteDistributions.push(distribution);
            });
            context.shift();
        }
        return distributionListMap;
    }

    public getStimulusProbabilityMap(sequence: Sequence): Map<string, number> {
        const context = sequence.getContext()
        if (context.length === 0) {
            throw new Error("cannot getStimulusProbabilityMap, sequence's context is empty");
        }
        return this._treeRoot.getProbabilityMap(context);
    }
    
    public getAllNgram(): Ngram[] {        
        return this._treeRoot.getAllNgram();
    }

}

function k_combinations(stimulusList: (Stimulus|Note)[], k: number) : Stimulus[][]{
    var i, j, combs, head, tailcombs;
    if (k > stimulusList.length || k <= 0) {
        return [];
    }
    if (k === stimulusList.length) {
        return [stimulusList];
    }
    if (k === 1) {
        combs = [];
        for (i = 0; i < stimulusList.length; i++) {
            combs.push([stimulusList[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < stimulusList.length - k + 1; i++) {
        head = stimulusList.slice(i, i+1);
        tailcombs = k_combinations(stimulusList.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

function interactionCombinations(stimulusList: Stimulus[], depth: number): Stimulus[][] {
    var k, i, combs, k_combs;
    combs = [];
    const kMax = Math.min(depth, stimulusList.length);
    for (k = 1; k <= kMax; k++) {
        k_combs = k_combinations(stimulusList, k);
        for (i = 0; i < k_combs.length; i++) {
            combs.push(k_combs[i]);
        }
    }
    return combs;
}