import chai from "chai";
const expect = chai.expect;
import "mocha";
import Note from "../../src/domain/Note";
import Sequence from "../../src/domain/Sequence";
import Stimulus from "../../src/domain/Stimulus";
import SPModel from "../../src/domain/SPModel";

describe("SP Model", () => {
    describe("Model constructor", () => {
        it("should throw ", () => {
            expect(() => {
                // tslint:disable-next-line: no-unused-expression
                new SPModel(0);
            }).to.throw;
        });
        it("should throw ", () => {
            expect(() => {
                // tslint:disable-next-line: no-unused-expression
                new SPModel(11);
            }).to.throw;
        });
        it("should create ", () => {
            // tslint:disable-next-line: no-unused-expression
            new SPModel(8);
        });
    });
    
    describe("#learn", () => {
        const m = new SPModel(8);

        it("learn sequence empty sequence", () => {
            const seq1 = new Sequence([]);
            m.learnSequence(seq1);
    
            let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));
            expect(probabilityMap.size).to.eql(0)
        });

        it("learn sequence of size 3", () => {
            const seq1 = new Sequence([new Stimulus("start"), new Stimulus("click"), new Stimulus("home")]);
            m.learnSequence(seq1);
    
            let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));
            
            expect(probabilityMap.size).to.eql(2);
            expect(probabilityMap.has("click"));
            expect(probabilityMap.has("home"));

            expect(probabilityMap.get("click")).eql(0.5);
            expect(probabilityMap.get("home")).eql(0.5);
        });

        it("get proba on empty sequence", () => {    
            expect(() => {
                let probabilityMap = m.getStimulusProbabilityMap(new Sequence([]));
            }).to.throw;
        });

        it("learn sequence of size 3", () => {
            const seq1 = new Sequence([new Stimulus("click"), new Stimulus("start"), new Stimulus("home")]);
            m.learnSequence(seq1);
    
            let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));
            expect(probabilityMap.size).to.eql(2);
            expect(probabilityMap.has("click"));
            expect(probabilityMap.has("home"));

            expect(probabilityMap.get("click")).eql(1/3);
            expect(probabilityMap.get("home")).eql(2/3);
        });

        it("should get proba", () => {  
            const seq1 = new Sequence([new Stimulus("click"), new Stimulus("start"), new Stimulus("home"), new Stimulus("click"), new Stimulus("click")]);
            m.learnSequence(seq1);  

            let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start"), new Stimulus("click")]));
            expect(probabilityMap.size).to.eql(2);
            expect(probabilityMap.has("click"));
            expect(probabilityMap.get("click")).eql(0.5);

            expect(probabilityMap.has("home"));
            expect(probabilityMap.get("home")).eql(0.5);

            probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("click"), new Stimulus("home")]));
            expect(probabilityMap.size).to.eql(1);
            expect(probabilityMap.get("click")).eql(1);
        });
    });

    describe("#notes", () => {
        const m = new SPModel(8);

        it ("should get not from empty model", () => {
            const distribMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]));
            expect(distribMap.size).eql(0);
        });

        it ("should learn a note", () => {
            const seq = new Sequence([new Stimulus("start"), new Note("bug")]);
            m.learnSequence(seq);

            const distribMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]));
            expect(distribMap.size).eql(1);
            expect(distribMap.has("bug")).to.be.true;
            const noteDistributions = distribMap.get("bug");
            if (noteDistributions) {
                expect(noteDistributions.length).to.eql(1);
                const noteDistrib = noteDistributions[0];

                expect(noteDistrib.noteOccurence).eql(1);
                expect(noteDistrib.context).lengthOf(1);
                expect(noteDistrib.note.value).eql("bug")
            }
            
        })

        it ("should get note from unexisting context", () => {
            const distribMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("click")]));
            expect(distribMap.size).eql(0);
        });
    });

    describe("#model size", () => {

        it ("should learn one sequence with a depth 1", () => {
            const m = new SPModel(1);

            const seq = new Sequence([new Stimulus("start"), new Stimulus("click"), new Stimulus("home")]);
            m.learnSequence(seq);

            const ngrams = m.getAllNgram()
            expect(ngrams).lengthOf(3);
        })

        it ("should learn two sequence with a depth 1", () => {
            const m = new SPModel(1);

            const seq = new Sequence([new Stimulus("start"), new Stimulus("click"), new Stimulus("type")]);
            m.learnSequence(seq);

            const ngrams = m.getAllNgram()
            expect(ngrams).lengthOf(3);
        })

        it ("should learn one sequence with a depth 2", () => {
            const m = new SPModel(2);

            const seq = new Sequence([new Stimulus("start"), new Stimulus("click"), new Stimulus("type")]);
            m.learnSequence(seq);

            const ngrams = m.getAllNgram()
            expect(ngrams).lengthOf(6);
        })

    });

    describe("#ngrams", () => {
        const m = new SPModel(8);

        it ("should get not from empty model", () => {
            const ngrams = m.getAllNgram();
            expect(ngrams).lengthOf(0)
        });

        
        it ("should get ngrams from a sequence with a note", () => {
            const seq = new Sequence([new Stimulus("start"), new Note("bug")]);
            m.learnSequence(seq);

            const ngrams = m.getAllNgram()
            expect(ngrams).lengthOf(1);
        })

        it ("should get ngrams from a sequence with two stimulus", () => {
            const seq = new Sequence([new Stimulus("start"), new Stimulus("click")]);
            m.learnSequence(seq);

            const ngrams = m.getAllNgram()
            expect(ngrams).lengthOf(3);
        })

        it ("should get ngrams from a sequence of multiple stimulus", () => {
            const seq = new Sequence([new Stimulus("start"), new Stimulus("click"), new Stimulus("home")]);
            m.learnSequence(seq);
            const ngrams = m.getAllNgram();
            expect(ngrams.find(ngram => ngram.key === "start")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "click")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "home")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "start -> click")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "start -> home")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "click -> home")).to.not.eql(undefined);
            expect(ngrams.find(ngram => ngram.key === "start -> click -> home")).to.not.eql(undefined);

            expect(ngrams.find(ngram => ngram.key === "start")?.occurence).eql(3);
            expect(ngrams.find(ngram => ngram.key === "click")?.occurence).eql(2);
            expect(ngrams.find(ngram => ngram.key === "home")?.occurence).eql(1);
            expect(ngrams.find(ngram => ngram.key === "start -> click")?.occurence).eql(2);
            expect(ngrams.find(ngram => ngram.key === "start -> home")?.occurence).eql(1);
            expect(ngrams.find(ngram => ngram.key === "click -> home")?.occurence).eql(1);
            expect(ngrams.find(ngram => ngram.key === "start -> click -> home")?.occurence).eql(1);
        });

    });
});

