import chai from "chai";
const expect = chai.expect;
import "mocha";
import Note from "../../src/domain/Note";
import Sequence from "../../src/domain/Sequence";
import Stimulus from "../../src/domain/Stimulus";
import FISModel from "../../src/domain/FISModel";
import NoteDistribution from "../../src/domain/NoteDistribution";

describe("Model constructor", () => {
    it("should throw ", () => {
        expect(() => {
            // tslint:disable-next-line: no-unused-expression
            new FISModel(0);
        }).to.throw;
    });
    it("should throw ", () => {
        expect(() => {
            // tslint:disable-next-line: no-unused-expression
            new FISModel(11);
        }).to.throw;
    });
    it("should create ", () => {
        // tslint:disable-next-line: no-unused-expression
        new FISModel( 8);
    });
});

describe("#learn", () => {
    it("learn sequence empty sequence", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([]);

        m.learnSequence(seq1);
        expect(m.size).to.eql(0);

        let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));

        expect(probabilityMap.size).to.eql(0)
    });

    it("should learn sequence", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);

        m.learnSequence(seq1);
        expect(m.size).to.eql(7);

        let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("start")]));

        expect(probabilityMap.size).to.eql(2)
        expect(probabilityMap.get("click")).to.eql(0.5);
        expect(probabilityMap.get("home")).to.eql(0.5)
    });

    it("should learn two sequences", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);
        const seq2 = new Sequence([new Stimulus("start"), new Stimulus("home")]);

        m.learnSequence(seq1);
        m.learnSequence(seq2);
        expect(m.size).to.eql(7);

        let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("home")]));
        expect(probabilityMap.size).to.eql(2)
        expect(probabilityMap.get("start")).to.eql(2/3);
        expect(probabilityMap.get("click")).to.eql(1/3)
    });

    it("should get probabilites from different orders", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([new Stimulus("click"), new Stimulus("start"), new Stimulus("home")]);
        const seq2 = new Sequence([new Stimulus("home"), new Stimulus("start"), ]);

        m.learnSequence(seq1);
        m.learnSequence(seq2);
        expect(m.size).to.eql(7);

        let probabilityMap = m.getStimulusProbabilityMap(new Sequence([new Stimulus("home")]));
        expect(probabilityMap.size).to.eql(2)
        expect(probabilityMap.get("start")).to.eql(2/3);
        expect(probabilityMap.get("click")).to.eql(1/3)
    });

});


describe("#ngrams", () => {
    it("ngrams from empty sequence", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([]);

        m.learnSequence(seq1);
        expect(m.size).to.eql(0);

        const ngrams = m.getAllNgram();
        expect(ngrams).to.lengthOf(0)
    });

    it("ngrams from 1 sequence", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);

        m.learnSequence(seq1);

        expect(m.size).to.eql(7);

        let ngrams = m.getAllNgram()

        expect(ngrams).lengthOf(7)
        const ngramsKeys = ngrams.map(ngram => ngram.key);
        expect(ngramsKeys.includes("start"))
        expect(ngramsKeys.includes("home"))
        expect(ngramsKeys.includes("click"))
        expect(ngramsKeys.includes("click -> home"))
        expect(ngramsKeys.includes("click -> start"))
        expect(ngramsKeys.includes("home -> start"))
        expect(ngramsKeys.includes(""))
    });

    it("should learn two sequences", () => {
        const m = new FISModel(8);
        const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);
        const seq2 = new Sequence([new Stimulus("home"), new Stimulus("start"), ]);

        m.learnSequence(seq1);
        m.learnSequence(seq2);

        expect(m.size).to.eql(7);
        let ngrams = m.getAllNgram()
        expect(ngrams.find(ngram => ngram.key ===  "click -> home -> start")?.occurence).to.eql(1)
        expect(ngrams.find(ngram => ngram.key ===  "click")?.occurence).to.eql(1)
        expect(ngrams.find(ngram => ngram.key ===  "home")?.occurence).to.eql(2)
        expect(ngrams.find(ngram => ngram.key ===  "start")?.occurence).to.eql(2)
        expect(ngrams.find(ngram => ngram.key ===  "home -> start")?.occurence).to.eql(2)
        expect(ngrams.find(ngram => ngram.key ===  "click -> home")?.occurence).to.eql(1)
    });

    describe("#notes", () => {

        it("notes from empty sequence", () => {
            const m = new FISModel(8);
            const seq1 = new Sequence([]);
    
            m.learnSequence(seq1);
            const noteDistributions = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]))
            expect(noteDistributions).lengthOf(0);
        });

        it("notes from sequence without notes", () => {
            const m = new FISModel(8);
            const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Stimulus("click")]);
    
            m.learnSequence(seq1);
            const noteDistributions = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]))
            expect(noteDistributions).lengthOf(0);
        });

        describe("#getNoteDistributionListMap", () => {
            const m = new FISModel(8);
            it("notes from sequence with notes", () => {
                const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home"), new Note("bug")]);
        
                m.learnSequence(seq1);
    
                let noteDistributionsMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]));
                expect(noteDistributionsMap.size).eql(1);
    
                let noteDistribs = noteDistributionsMap.get("bug");
                if (noteDistribs) {
                    expect(noteDistribs.length).eql(1);
                
                    expect(noteDistribs[0].note.value).to.eql("bug")
                    expect(noteDistribs[0].noteOccurence).to.eql(1);
                    expect(noteDistribs[0].contextOccurence).to.eql(1);
                
                }
                
                
                let noteDistributionsMap2 = m.getNoteDistributionListMap(new Sequence([new Stimulus("home -> start")]));
                noteDistribs = noteDistributionsMap2.get("bug");
                if (noteDistribs) {
                    expect(noteDistribs.length).eql(1)
                    expect(noteDistribs[0].note.value).to.eql("bug")
                    expect(noteDistribs[0].noteOccurence).to.eql(1);
                    expect(noteDistribs[0].contextOccurence).to.eql(1);

                }
                

            });
            it("should increment context occurence", () => {
                const seq1 = new Sequence([new Stimulus("start"), new Stimulus("home")]);
                m.learnSequence(seq1);

                let noteDistributionsMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]));
                expect(noteDistributionsMap.size).eql(1);
    
                let noteDistribs = noteDistributionsMap.get("bug");
                if (noteDistribs) {
                    expect(noteDistribs.length).eql(1)
                    expect(noteDistribs[0].note.value).to.eql("bug")
                    expect(noteDistribs[0].noteOccurence).to.eql(1);
                    expect(noteDistribs[0].contextOccurence).to.eql(2);
                }
                
            })

            it("should increment note occurence", () => {
                const seq1 = new Sequence([new Note("bug"), new Stimulus("start"), new Stimulus("home")]);
                m.learnSequence(seq1);

                let noteDistributionsMap = m.getNoteDistributionListMap(new Sequence([new Stimulus("start")]));
                expect(noteDistributionsMap.size).eql(1);
    
                let noteDistribs = noteDistributionsMap.get("bug");
                if (noteDistribs) {
                    expect(noteDistribs.length).eql(1)
                    expect(noteDistribs[0].note.value).to.eql("bug")
                    expect(noteDistribs[0].noteOccurence).to.eql(2);
                    expect(noteDistribs[0].contextOccurence).to.eql(3);
                }
            })
            
        })
    })
});