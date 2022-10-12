import Sequence from "./Sequence";
import NoteDistribution from "./NoteDistribution";
import Stimulus from "./Stimulus";
import Ngram from "./Ngram";
import { generate } from "shortid";
import Note from "./Note";

const MAX_DEPTH = 10;

export default abstract class Model {

    constructor(depth: number, id?: string) {
        if (id) {
            this._id = id;
        } else {
            this._id = generate();
        }

        if (depth <= 0 || depth > MAX_DEPTH) {
            throw new Error("cannot create model, depth between 1 and " + MAX_DEPTH);
        }
        this._depth = depth;


        this._sessionIdList = [];
    }

    get id(): string {
        return this._id;
    }

    get depth(): number {
        return this._depth;
    }

    private _id: string;
    private readonly _depth: number;
    private _sessionIdList: string[];

    public abstract learnSequence(sequence: Sequence): void;
    public abstract addStimulusKnowingContext(stimulus: Stimulus, context: Stimulus[]): void;
    public abstract addNoteKnowingContext(note: Note, context: Stimulus[]): void;
    public abstract getNoteDistributionListMap(sequence: Sequence): Map<string, NoteDistribution[]>;
    public abstract getStimulusProbabilityMap(sequence: Sequence): Map<string, number>;
    public abstract getAllNgram(): Ngram[];

    public linkWithSession(sessionId: string): void {
        if (!this._sessionIdList.includes(sessionId)) {
            this._sessionIdList.push(sessionId);
        }
    }

    public getLinkedSessionIdList(): string[] {
        return this._sessionIdList.slice(0, this._sessionIdList.length);
    }

    public crossEntropy(context: Stimulus[]): number {
        const probaOfUnknown = 1e-6;

        if (context.length === 0) {
            return probaOfUnknown;
        }

        let probabilitySum = 0;
        for (let index = context.length - 1; index > 0; index--) {
            const lastStimulus = context[index];
            const sequence = new Sequence(context.slice(0, index));
            const probabilityMap = this.getStimulusProbabilityMap(sequence);

            const modelProba = probabilityMap.get(lastStimulus.value);
            let proba;
            if (modelProba === null || modelProba === undefined || modelProba === 0) {
                proba = probaOfUnknown;
            } else {
                proba = modelProba * (1 - probaOfUnknown);
            }
            probabilitySum = probabilitySum + Math.log2(proba);
        }
        return -(probabilitySum / (context.length - 1));
    }

    public profileBasedCoverage(otherModel: Model): any {
        const coverages: any = {};
        const ngrams = this.getAllNgram();
        const ngramsToCover = otherModel.getAllNgram();

        const ngramsSorted: Ngram[][] = sortNgram(ngrams, this.depth);
        const otherNgramsSorted: Ngram[][] = sortNgram(ngramsToCover, this.depth);

        for (let i = 0; i < otherModel.depth; i++) {
            if (otherNgramsSorted[i].length > 0) {
                coverages[(i + 1).toString()] =  profileBasedCoverageForN(ngramsSorted[i], otherNgramsSorted[i]);
            }
        }
        coverages.all = profileBasedCoverageForN(ngrams, ngramsToCover);
        return coverages;
    }

    public fitContextToDepth(context: Stimulus[]): Stimulus[] {
        if (context.length < (this.depth)) {
            return context;
        } else {
            return context.slice(context.length - this.depth, context.length);
        }
    }
}

function sortNgram(ngrams: Ngram[], n: number): Ngram[][] {
    const ngramsPerDepth : Ngram[][]= [];
    for (let i = 0; i < n; ++i) {
        ngramsPerDepth.push([]);
    }
    for (const ngram of ngrams) {
        ngramsPerDepth[ngram.n - 1].push(ngram);
    }
    return ngramsPerDepth;
}


function profileBasedCoverageForN(ngrams: Ngram[], ngramsToCover: Ngram[]): {} {
    let totalOccurencesOther = 0;
    for (const ngram of ngramsToCover) {
        totalOccurencesOther += ngram.occurence;
    }

    const coverProbabilityMap = new Map();
    for (const ngram of ngramsToCover) {
        const probabilityOfSequence = ngram.occurence / totalOccurencesOther;
        coverProbabilityMap.set(ngram.key, probabilityOfSequence);
    }

    let coverage = 0;
    for (const ngram of ngrams) {
        if (coverProbabilityMap.has(ngram.key)) {
            coverage += coverProbabilityMap.get(ngram.key);
        }
    }
    const coverageRate = parseFloat(coverage.toFixed(2));
    const notCovered = ngramsToCover
        .filter((other) => !ngrams.some((ngram) => other.key === ngram.key))
        .map((ngram) => ({
            occurence: ngram.occurence,
            actions: ngram.key,
            probability: coverProbabilityMap.get(ngram.key),
        }))
        .sort((a, b) => b.probability - a.probability);
    const totalToCover = ngramsToCover.length;
    const covered = totalToCover - notCovered.length;

    return {
        coverageRate,
        notCovered,
        totalToCover,
        covered,
    };
}
