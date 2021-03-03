import chai from "chai";
const expect = chai.expect;
import Note from "../../src/domain/Note";
import Sequence from "../../src/domain/Sequence";
import Stimulus from "../../src/domain/Stimulus";
import "mocha";

describe("Sequence clone", () => {
    it("should create a sequence and pop and clone", () => {
        const seq = new Sequence();
        seq.addStimulus(new Stimulus("start"));
        seq.addStimulus(new Stimulus("home"));
        seq.addNote(new Note("bug"));
        seq.addStimulus(new Stimulus("scroll"));

        let [clone, pop] = seq.cloneAndPop();
        expect(clone.length).to.equal(3);
        expect(pop).instanceOf(Stimulus);

        [clone, pop] = clone.cloneAndPop();
        expect(clone.length).to.equal(2);
        expect(pop).instanceOf(Note);

        [clone, pop] = clone.cloneAndPop();
        expect(clone.length).to.equal(1);
        expect(pop).instanceOf(Stimulus);

        [clone, pop] = clone.cloneAndPop();
        expect(clone.length).to.equal(0);
        expect(pop).instanceOf(Stimulus);

        [clone, pop] = clone.cloneAndPop();
        expect(clone.length).to.equal(0);
        expect(pop).eql(undefined);
    });
});
