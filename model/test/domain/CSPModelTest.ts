import chai from "chai";
const expect = chai.expect;
import "mocha";
import CSPModel from "../../src/domain/CSPModel";
import Note from "../../src/domain/Note";
import Sequence from "../../src/domain/Sequence";
import Stimulus from "../../src/domain/Stimulus";

describe("Model constructor", () => {
    it("should throw ", () => {
        expect(() => {
            // tslint:disable-next-line: no-unused-expression
            new CSPModel(0);
        }).to.throw;
    });
    it("should throw ", () => {
        expect(() => {
            // tslint:disable-next-line: no-unused-expression
            new CSPModel(11);
        }).to.throw;
    });
    it("should create ", () => {
        // tslint:disable-next-line: no-unused-expression
        new CSPModel( 8);
    });
});
describe("#learn", () => {
    it("should learn sequence", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addStimulus(new Stimulus("click"));
        m.learnSequence(seq1);
        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("home"));
        seq2.addNote(new Note("bug:hard"));
        seq2.addStimulus(new Stimulus("scroll"));
        m.learnSequence(seq2);
        let treeHome = m.getTreeByStimulus(new Stimulus("home"));
        let treeStart = m.getTreeByStimulus(new Stimulus("start"));
        if (treeHome && treeStart) {
            expect(treeHome.getSuccessorStimulusOccurence(new Stimulus("click"))).to.equal(1);
            expect(treeStart.getSuccessorStimulusOccurence(new Stimulus("home"))).to.equal(2);
            const startHome = treeHome.getPrefixTreeByStimulus(new Stimulus("start"));
            if (startHome) {
                expect(startHome.getSuccessorStimulusOccurence(new Stimulus("click"))).to.equal(1);
                expect(startHome.getSuccessorNoteOccurence(new Note("bug:hard"))).to.equal(1);
            }
        }
    });

    it("should learn stimulus sequence with good occurences", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addStimulus(new Stimulus("click"));
        m.learnSequence(seq1);

        let startTree = m.getTreeByStimulus(new Stimulus("start"));
        let homeTree = m.getTreeByStimulus(new Stimulus("home"));
        let clickTree = m.getTreeByStimulus(new Stimulus("click"));
        
        if (startTree && homeTree && clickTree) {
            expect(startTree.occurence).to.equal(1);
            expect(homeTree.occurence).to.equal(1);
            expect(clickTree.occurence).to.equal(1);
        }

    });

    it("should learn stimulus and note sequence with good occurences", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Note("bug"));
        seq1.addStimulus(new Note("bug"));
        seq1.addStimulus(new Stimulus("home"));
        m.learnSequence(seq1);

        let startTree = m.getTreeByStimulus(new Stimulus("start"));
        let homeTree = m.getTreeByStimulus(new Stimulus("home"));
        
        if (startTree && homeTree) {
            expect(startTree.occurence).to.equal(1);
            expect(homeTree.occurence).to.equal(1);
        }

    });

    it("should return good ngram", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Note("bug"));
        seq1.addStimulus(new Note("bug"));
        seq1.addStimulus(new Stimulus("home"));
        m.learnSequence(seq1);

        const ngramSet = m.getAllNgram();

        expect(ngramSet.length).to.equal(3);
        expect(ngramSet[0].key).to.equal("start -> home");
        expect(ngramSet[0].occurence).to.equal(1);
        expect(ngramSet[1].key).to.equal("home");
        expect(ngramSet[1].occurence).to.equal(1);
        expect(ngramSet[2].key).to.equal("start");
        expect(ngramSet[2].occurence).to.equal(1);
        expect(ngramSet[2].successorNote.get("bug")).to.equal(2);
        expect(ngramSet[2].successorStimulus.get("home")).to.equal(1);

    });
});
describe("#getStimulusProbabilityMap", () => {
    it("should compute proba", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addStimulus(new Stimulus("click"));
        m.learnSequence(seq1);
        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("home"));
        seq2.addStimulus(new Stimulus("scroll"));
        m.learnSequence(seq2);
        const probaMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start"), new Stimulus("home")]));
        expect(probaMap.get("click")).to.equal(0.5);
        expect(probaMap.get("scroll")).to.equal(0.5);
    });
});
describe("#getNoteDistributionListMap", () => {

    it("should get a distribution after : one stimulus, one comment", () => {
        const m = new CSPModel(3);
        const seq = new Sequence();
        seq.addStimulus(new Stimulus("home"));
        seq.addNote(new Note("bug:hard"));
        m.learnSequence(seq);

        const distributionListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("home")]));
        const distributionList = distributionListMap.get("bug:hard");
        expect(distributionList).to.be.lengthOf(1);
        if (distributionList) {
            const firstDistribution = distributionList[0];
            if (firstDistribution) {
                expect(firstDistribution.contextOccurence).to.eql(1);
                expect(firstDistribution.noteOccurence).to.eql(1);
            }
        }
    });

    it("should get a distribution after : two stimulus, one comment", () => {
        const m = new CSPModel(3);
        const seq = new Sequence();
        seq.addStimulus(new Stimulus("start"));
        seq.addStimulus(new Stimulus("click"));
        seq.addNote(new Note("bug:hard"));
        m.learnSequence(seq);

        const distributionListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start"), new Stimulus("click")]));
        const distributionList = distributionListMap.get("bug:hard");
        expect(distributionList).to.be.lengthOf(2);
        if (distributionList) {
            let firstDistribution = distributionList[0];
            let secondDistribution  = distributionList[1];
            if (firstDistribution && secondDistribution) {
                expect(firstDistribution.contextOccurence).to.eql(1);
                expect(firstDistribution.noteOccurence).to.eql(1);
                expect(secondDistribution.contextOccurence).to.eql(1);
                expect(secondDistribution.noteOccurence).to.eql(1);
            }
            
        }
        
    });

    it("should get a distribution after : two stimulus, one comment, one stimulus", () => {
        const m = new CSPModel(3);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("click$value"));
        seq1.addStimulus(new Stimulus("click$value"));
        m.learnSequence(seq1);

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("click"));
        seq2.addNote(new Note("bug:hard"));
        seq2.addStimulus(new Stimulus("end"));

        m.learnSequence(seq2);

        const distributionListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start"), new Stimulus("click")]));
        const distributionList = distributionListMap.get("bug:hard");
        expect(distributionList).to.be.lengthOf(2);
        if (distributionList) {
            let firstDistribution = distributionList[0];
            let secondDistribution = distributionList[1];
            if (firstDistribution && secondDistribution) {
                expect(firstDistribution.contextOccurence).to.eql(1);
                expect(firstDistribution.noteOccurence).to.eql(1);

                expect(secondDistribution.contextOccurence).to.eql(1);
                expect(secondDistribution.noteOccurence).to.eql(1);

            }
            
        }
        
    });

    it("should compute distribution with context occuring multiple time", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addStimulus(new Stimulus("end"));
        m.learnSequence(seq1);

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("home"));
        seq2.addNote(new Note("bug:hard"));
        seq2.addStimulus(new Stimulus("end"));

        m.learnSequence(seq2);

        const distribListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start"), new Stimulus("home")]));
        if (distribListMap) {
            let bugHardDistribList = distribListMap.get("bug:hard");
            if (bugHardDistribList) {
                expect(bugHardDistribList.length).to.equal(2);
                let firstBugHard = bugHardDistribList[0];
                if (firstBugHard) {
                    expect(firstBugHard.noteOccurence).to.equal(1);
                    expect(firstBugHard.contextOccurence).to.equal(2);
                }
            }
        }
        
    });

    it("should compute distribution with note occuring multiple time", () => {
        const m = new CSPModel(3);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addNote(new Note("bug:hard"));
        seq1.addStimulus(new Stimulus("end"));
        m.learnSequence(seq1);

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("home"));
        seq2.addNote(new Note("bug:hard"));
        seq2.addStimulus(new Stimulus("end"));

        m.learnSequence(seq2);

        const distribListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start"), new Stimulus("home")]));
        
        if (distribListMap) {
            let bugHardList = distribListMap.get("bug:hard");
            if (bugHardList) {
                expect(bugHardList.length).to.equal(2);
                let firstBugHard = bugHardList[0];
                if (firstBugHard) {
                    expect(firstBugHard.noteOccurence).to.equal(2);
                    expect(firstBugHard.contextOccurence).to.equal(2);
                }
            }
        }
    });

    it("should learn a note in different context and get the distribution", () => {
        const m = new CSPModel(3);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("home"));
        seq1.addNote(new Note("bug:hard"));
        seq1.addStimulus(new Stimulus("end"));

        m.learnSequence(seq1);

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("start"));
        seq2.addStimulus(new Stimulus("login"));
        seq2.addStimulus(new Stimulus("home"));
        seq2.addNote(new Note("bug:hard"));
        seq2.addStimulus(new Stimulus("end"));

        m.learnSequence(seq2);

        const distribListMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start"), new Stimulus("home")]));
        expect(distribListMap.size).to.equal(1);
        const noteDistributions = distribListMap.get("bug:hard");

        expect(noteDistributions).lengthOf(2);

        if (noteDistributions && noteDistributions.length > 1) {
            const distribution1 = noteDistributions[0];
            expect(distribution1.context).eql([new Stimulus("start"), new Stimulus("home")]);
            expect(distribution1.noteOccurence).eql(1);
            expect(distribution1.contextOccurence).eql(1);

            const distribution2 = noteDistributions[1];
            expect(distribution2.context).eql([new Stimulus("home")]);
            expect(distribution2.noteOccurence).to.equal(2);
            expect(distribution2.contextOccurence).to.equal(2);
        }
        
    });

});
describe("#getStimulusProbabilityMap as in routeTest", () => {
    it("should compute distribution", () => {
        const m = new CSPModel(2);
        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("start"));
        seq1.addStimulus(new Stimulus("click$value"));
        seq1.addStimulus(new Stimulus("click$value"));
        m.learnSequence(seq1);
        const probaMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));
        expect(probaMap.size).to.equal(1);
    });
});

describe("ProfileBasedCoverage", () => {
    it("should return 0 if no ngrams in common", () => {
        const modelA = new CSPModel(2);
        const modelB = new CSPModel(2);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("a"));
        seq1.addStimulus(new Stimulus("b"));

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("c"));
        seq2.addStimulus(new Stimulus("d"));

        modelA.learnSequence(seq1);
        modelB.learnSequence(seq2);

        const coverages = modelA.profileBasedCoverage(modelB);

        expect(coverages[1].coverageRate).to.eql(0);
        expect(coverages[2].coverageRate).to.eql(0);
        expect(coverages.all.coverageRate).to.eql(0);

    });

    it("should return 0 if no ngrams in common", () => {
        const modelA = new CSPModel(2);
        const modelB = new CSPModel(2);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("a"));
        seq1.addStimulus(new Stimulus("b"));
        seq1.addStimulus(new Stimulus("c"));
        seq1.addStimulus(new Stimulus("d"));

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("e"));
        seq2.addStimulus(new Stimulus("f"));

        modelA.learnSequence(seq1);
        modelB.learnSequence(seq2);

        const coverages = modelA.profileBasedCoverage(modelB);
        expect(coverages[1].coverageRate).to.eql(0);
        expect(coverages[2].coverageRate).to.eql(0);
        expect(coverages.all.coverageRate).to.eql(0);

    });

    it("should return 1 if all ngrams in common", () => {
        const modelA = new CSPModel(2);
        const modelB = new CSPModel(2);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("a"));
        seq1.addStimulus(new Stimulus("b"));

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("a"));
        seq2.addStimulus(new Stimulus("b"));

        modelA.learnSequence(seq1);
        modelB.learnSequence(seq2);

        const coverages = modelA.profileBasedCoverage(modelB);

        expect(coverages[1].coverageRate).to.eql(1);
        expect(coverages[2].coverageRate).to.eql(1);
        expect(coverages.all.coverageRate).to.eql(1);
    });

    it("should compute with half sequence covered", () => {
        const modelA = new CSPModel(2);
        const modelB = new CSPModel(2);

        const seq1 = new Sequence();
        seq1.addStimulus(new Stimulus("a"));
        seq1.addStimulus(new Stimulus("b"));

        const seq2 = new Sequence();
        seq2.addStimulus(new Stimulus("c"));
        seq2.addStimulus(new Stimulus("d"));

        modelA.learnSequence(seq1);

        modelB.learnSequence(seq1);
        modelB.learnSequence(seq2);

        const coverage = modelA.profileBasedCoverage(modelB);

        expect(coverage[1].coverageRate).to.eql(0.5);
        expect(coverage[2].coverageRate).to.eql(0.5);
        expect(coverage.all.coverageRate).to.eql(0.5);
    });

    it("should compute", () => {
        const modelA = new CSPModel(2);
        const modelB = new CSPModel(2);

        modelA.learnSequence(new Sequence([new Stimulus("a"), new Stimulus("b")]));
        modelA.learnSequence(new Sequence([new Stimulus("a"), new Stimulus("c")]));

        modelB.learnSequence(new Sequence([new Stimulus("a"), new Stimulus("b")]));
        modelB.learnSequence(new Sequence([new Stimulus("b"), new Stimulus("c")]));
        modelB.learnSequence(new Sequence([new Stimulus("a"), new Stimulus("c")]));

        const coverage = modelA.profileBasedCoverage(modelB);

        expect(coverage[1].coverageRate).to.eql(1);
        expect(coverage[2].coverageRate).to.eql(0.67);
        expect(coverage.all.coverageRate).to.eql(0.89);
        expect(coverage.all.notCovered.length).to.eql(1);

    });

});
