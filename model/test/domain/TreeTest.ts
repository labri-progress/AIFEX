import chai from "chai";
const expect = chai.expect;
import "mocha";
import Note from "../../src/domain/Note";
import Stimulus from "../../src/domain/Stimulus";
import Tree from "../../src/domain/TreeCSP";

describe("Tree constructor", () => {
    it("should build tree", () => {
        const t = new Tree(new Stimulus("click"));
        expect(t.stimulusSuccessorOccurence).to.equal(0);
    });
});
describe("addSuccessorStimulus", () => {
    it("should add a first successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorStimulus(new Stimulus("now"));
        expect(t.stimulusSuccessorOccurence).to.equal(1);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
    });
    it("should add two successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorStimulus(new Stimulus("now"));
        t.addSuccessorStimulus(new Stimulus("now"));
        expect(t.stimulusSuccessorOccurence).to.equal(2);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(2);
    });
    it("should add three successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorStimulus(new Stimulus("now"));
        t.addSuccessorStimulus(new Stimulus("now"));
        t.addSuccessorStimulus(new Stimulus("here"));
        expect(t.stimulusSuccessorOccurence).to.equal(3);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(2);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("here"))).to.equal(1);
    });
});
describe("get Stimulus, Successor and Ngram", () => {
    it("should add a first successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.contextOccurs([new Stimulus("click")]);
        expect(t.stimulus.value).to.equal("click");
        t.addSuccessorStimulus(new Stimulus("now"));
        expect(t.successorStimulusSet.length).to.equal(1);
        expect(t.successorStimulusSet[0].value).to.equal("now");
        expect(t.getAllNgram().length).to.equal(1);
        expect(t.getAllNgram()[0].key).to.equal("click");
        expect(t.getAllNgram()[0].occurence).to.equal(1);
    });
    it("should add two successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorStimulus(new Stimulus("now"));
        t.addSuccessorStimulus(new Stimulus("now"));
        expect(t.successorStimulusSet.length).to.equal(1);
    });
});
describe("learnStimulusKnowingContext", () => {
    it("should return when lastWord is different from stimulus", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("keypress")]);
        expect(t.stimulusSuccessorOccurence).to.equal(0);
    });
    it("should learn one stimulus", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("click")]);
        expect(t.stimulusSuccessorOccurence).to.equal(1);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
    });
    it("should learn one stimulus, with two stimulus sequence", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("home"), new Stimulus("click")]);
        expect(t.stimulusSuccessorOccurence).to.equal(1);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
        expect(t.getPrefixTreeByStimulus(new Stimulus("home"))?.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
    });
    it("should learn one stimulus, with three stimulus sequence", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);
        expect(t.stimulusSuccessorOccurence).to.equal(1);
        expect(t.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
        expect(t.getPrefixTreeByStimulus(new Stimulus("home"))?.getPrefixTreeByStimulus(new Stimulus("start"))?.getSuccessorStimulusOccurence(new Stimulus("now"))).to.equal(1);
    });
});
describe("get Stimulus, Successor and Ngram when learn", () => {
    it("learn one stimulus, with two stimulus sequence", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("home"), new Stimulus("click")]);
        expect(t.getAllNgram().length).to.equal(2);
        expect(t.getAllNgram()[0].key).to.equal("home -> click");
        expect(t.getAllNgram()[1].key).to.equal("click");
        
    });
});

describe("getStimulusProbability", () => {
    it("should return 100% proba", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("click")]);
        const proba = t.getStimulusProbability(new Stimulus("now"), [new Stimulus("click")]);
        expect(proba).to.equal(1);

    });
    it("should return 50% proba", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("click")]);
        t.learnStimulusKnowingContext(new Stimulus("home"), [new Stimulus("click")]);
        const proba = t.getStimulusProbability(new Stimulus("now"), [new Stimulus("click")]);
        expect(proba).to.equal(0.5);

    });
});
describe("getProbalityList", () => {
    it("should compute 2 probabilities", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("home"), [new Stimulus("click")]);
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("home"), new Stimulus("click")]);
        const probaList = t.getStimulusProbabilityList(new Stimulus("now"), [new Stimulus("home"), new Stimulus("click")]);
        expect(probaList.length).to.equal(2);
        expect(probaList[1]).to.equal(1);
        expect(probaList[0]).to.equal(0.5);
    });
});
describe("getInterpolatedProbabilityMap", () => {
    it("should compute 2 probabilities as expected", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnStimulusKnowingContext(new Stimulus("home"), [new Stimulus("click")]);
        t.learnStimulusKnowingContext(new Stimulus("now"), [new Stimulus("home"), new Stimulus("click")]);
        const probaMap = t.getStimulusInterpolatedProbabilityMap([new Stimulus("home"), new Stimulus("click")], 2);
        const homeExpected = 0.5 / (0.5 + 0.5 + 2);
        const nowExpected = (2 + 0.5) / (0.5 + 0.5 + 2);
        expect(probaMap.get("home")).to.equal(homeExpected);
        expect(probaMap.get("now")).to.equal(nowExpected);
    });
});
describe("addSuccessorNote", () => {
    it("should add a first successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorNote(new Note("ok"));
        expect(t.getSuccessorNoteOccurence(new Note("ok"))).to.equal(1);
    });
    it("should add two successor", () => {
        const t = new Tree(new Stimulus("click"));
        t.addSuccessorNote(new Note("now"));
        t.addSuccessorNote(new Note("now"));
        expect(t.getSuccessorNoteOccurence(new Note("now"))).to.equal(2);
    });
});
describe("learnNoteKnowingContext", () => {
    it("should learn one stimulus", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("click")]);
        expect(t.getSuccessorNoteOccurence(new Note("ok"))).to.equal(1);
    });
    it("should learn one word, with two words sequence", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("home"), new Stimulus("click")]);
        expect(t.getSuccessorNoteOccurence(new Note("ok"))).to.equal(1);
        expect(t.getPrefixTreeByStimulus(new Stimulus("home"))?.getSuccessorNoteOccurence(new Note("ok"))).to.equal(1);
    });
});

describe("getNoteDistributionList with context of length 1", () => {
    it("should return distribution when tree learn only one Note", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("click")]);
        const distributionMap = t.getNoteDistributionsFromPrefixes([new Stimulus("click")]);
        const distribution = distributionMap.get("ok");
        if (distribution) {
            expect(distribution.noteOccurence).to.equal(1);
            expect(distribution.contextOccurence).to.equal(0);
        }
    });

    it("should return distribution when tree learn one Stimulus and one Note", () => {
        const t = new Tree(new Stimulus("click"));
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("home"), new Stimulus("click")]);
        const distributionMap = t.getNoteDistributionsFromPrefixes([new Stimulus("click")]);
        const distribution = distributionMap.get("ok");
        if (distribution) {
            expect(distribution.noteOccurence).to.equal(1);
            expect(distribution.contextOccurence).to.equal(0);
        }
    });

    it("should get one element in the list", () => {
        const t = new Tree(new Stimulus("click"));

        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("click")]);
        const distributionMap = t.getNoteDistributionsFromPrefixes([new Stimulus("click")]);
        const distribution = distributionMap.get("ok");
        if (distribution) {
            expect(distribution.noteOccurence).to.equal(1);
            expect(distribution.contextOccurence).to.equal(0);
        }
    });
});

describe("getNoteDistributionList with context of length 2", () => {
    it("should get one element in the list", () => {
        const t = new Tree(new Stimulus("home"));
        t.contextOccurs([new Stimulus("start"), new Stimulus("home")]);
        t.learnStimulusKnowingContext(new Stimulus("click"), [new Stimulus("start"), new Stimulus("home")]);
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("start"), new Stimulus("home")]);
        const distributionMap = t.getNoteDistributionsFromPrefixes([new Stimulus("home")]);
        const distribution = distributionMap.get("ok");
        if (distribution) {
            expect(distribution.noteOccurence).to.equal(1);
            expect(distribution.contextOccurence).to.equal(1);
        }
    });
});

describe("getNoteDistributionMap", () => {
    it("should get one element in the map", () => {
        const t = new Tree(new Stimulus("home"));
        t.contextOccurs([new Stimulus("start"), new Stimulus("home")]);
        t.learnStimulusKnowingContext(new Stimulus("click"), [new Stimulus("start"), new Stimulus("home")]);
        t.learnNoteKnowingContext(new Note("ok"), [new Stimulus("start"), new Stimulus("home")]);
        const map = t.getNoteDistributionsFromPrefixes([new Stimulus("start"), new Stimulus("home")]);
        const distribution = map.get("ok");

        if (distribution) {
            expect(distribution.noteOccurence).to.equal(1);
            expect(distribution.contextOccurence).to.equal(1);
        }
    });
});

