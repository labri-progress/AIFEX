import Sequence from "./Sequence";
import NoteDistribution from "./NoteDistribution";
import Stimulus from "./Stimulus";
import Model from "./Model";
import Ngram from "./Ngram";
import ItemSet from "./ItemSet";


export default class FISModel extends Model {

    private _itemSetMap: Map<string, ItemSet>;

    constructor(depth: number, id?: string) {
        super(depth, id);
        this._itemSetMap = new Map();
    }

    get size() {
        return this._itemSetMap.size
    }
    
    public getAllNgram(): Ngram[] {
        const ngrams = [];
        for (const [ngramKey, itemSet] of this._itemSetMap) {
            ngrams.push(new Ngram(ngramKey.split(' -> ').map(value => new Stimulus(value)), itemSet.occurrence))
        }
        return ngrams;
    }

    public learnSequence(sequence: Sequence): void {
        if (sequence.length <= 0) {
            return
        }
        let notes = sequence.getNotes()
        let context = sequence.getContext();
        context = this.sortContext(context)
    
        let depth = Math.min(this.depth, context.length);
        let combinations = stimulusCombinations(context, depth);

        // Update Successors
        combinations.forEach((combination) => {
            if (combination.length === 0) {
                return
            }
            let key = new ItemSet(combination).key;
            let itemSet = this._itemSetMap.get(key);
            if (! itemSet) {
                itemSet = new ItemSet(combination);
                this._itemSetMap.set(key, itemSet)
            }
            itemSet.occurrence++;
            notes.forEach(note => {
                if (itemSet) {
                    itemSet.addNote(note);
                }
            })

            // Update the successorsMap
            if (combination.length > 1) {
                for (let i = 0; i < combination.length; i++) {
                    const dupCombinations = combination.slice();
                    const interactionKey = dupCombinations.splice(i,1)[0];
                    
                    // Create itemset with 0 occurences, since it will be added in a further iteration
                    let subItemSet = new ItemSet(dupCombinations);
                    let subItemSetInMap = this._itemSetMap.get(subItemSet.key)
                    if (!subItemSetInMap) {
                        this._itemSetMap.set(subItemSet.key, subItemSet);
                    } else {
                        subItemSet = subItemSetInMap;
                    }
                    subItemSet.successorsMap.set(interactionKey.value, itemSet);
                }
            }
        })
    }

    public getStimulusProbabilityMap(sequence: Sequence): Map<string, number> {
        const sortedContext = this.sortContext(sequence.getContext());
        const key = new ItemSet(sortedContext).key;
        let probabilityMap = new Map<string, number>();
        if (!this._itemSetMap.has(key)) {
            return probabilityMap
        } 
        else {
            const itemSet = this._itemSetMap.get(key);
            if (!itemSet) {
                return probabilityMap;
            }
            if (itemSet.successorsMap.size === 0) {
                return probabilityMap;
            }
            let totalOccurence = 0;
            for (const successor of itemSet.successorsMap.values()) {
                totalOccurence += successor.occurrence;
            }
            for (const [key, successor] of itemSet.successorsMap) {
                probabilityMap.set(key, successor.occurrence / totalOccurence);

            }
        }
        return probabilityMap;
    }

    public getNoteDistributionListMap(sequence: Sequence): Map<string, NoteDistribution[]> {
        const context = this.sortContext(sequence.getContext());
        let depth = Math.min(this.depth, context.length);
        let combinations = stimulusCombinations(context, depth);
        let distributionMap = new Map<string, NoteDistribution[]>();

        combinations.forEach((combination) => {
            const itemSet = this._itemSetMap.get(new ItemSet(combination).key);
            if (!itemSet) {
                return;
            }
            const noteDistributions = itemSet.noteDistributions;

            noteDistributions.forEach((noteDistribution) => {
                let noteDistributions = distributionMap.get(noteDistribution.note.value);
                if (!noteDistributions) {
                    noteDistributions = [];
                    distributionMap.set(noteDistribution.note.value, noteDistributions);
                }
                noteDistributions.push(noteDistribution);
            }) 
        })       
        return distributionMap;
    }

    private sortContext(context: Stimulus[]) {
        const copy = context.slice();
        copy.sort(function(a, b) {
            var textA = a.value.toUpperCase();
            var textB = b.value.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        return copy;
    }
}

function k_combinations(stimulusList: Stimulus[], k: number) : Stimulus[][] {
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

function stimulusCombinations(stimulusList: Stimulus[], depth: number): Stimulus[][] {
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