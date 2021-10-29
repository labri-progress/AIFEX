import Ngram from "./Ngram";

export function stochasticCoverage(ngrams: Ngram[], ngramsToCover: Ngram[]): { coverage: number, coverageMap: Map<string, number> } {

    if (ngramsToCover.length === 0) {
        return {
            coverage: 1,
            coverageMap: new Map(),
        };
    }

    let totalOccurencesOther = 0;
    for (const ngram of ngramsToCover) {
        totalOccurencesOther += ngram.occurence;
    }

    const coverageMap = new Map();
    for (const ngram of ngramsToCover) {
        const probabilityOfSequence = ngram.occurence / totalOccurencesOther;
        coverageMap.set(ngram.key, probabilityOfSequence);
    }

    let coverage = 0;
    for (const ngram of ngrams) {
        if (coverageMap.has(ngram.key)) {
            coverage += coverageMap.get(ngram.key);
        }
    }
    return {
        coverage,
        coverageMap,
    };
}
