import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import Session from "../../src/domain/Session";
import { computeCoverageScore, computeMinimalExplorationsCoveringAllActions, minimizationRound} from "../../src/domain/TestService";

describe("computeCoverageScore", () => {
    it("should return 0 (empty, empty)", () => {
        const score = computeCoverageScore([], []);
        expect(score).to.equal(0);
    });
    it("should return 0 (empty, start)", () => {
        const start = new Action("start");
        const score = computeCoverageScore([], [start]);
        expect(score).to.equal(0);
    });
    it("should return 0 (start, empty)", () => {
        const start = new Action("start");
        const score = computeCoverageScore([start], []);
        expect(score).to.equal(0);
    });
    it("should return 1 (start, start)", () => {
        const start = new Action("start");
        const score = computeCoverageScore([start], [start]);
        expect(score).to.equal(1.2);
    });
    it("should return 0.5 (start - start, start)", () => {
        const start = new Action("start");
        const score = computeCoverageScore([start, start], [start]);
        expect(score).to.equal(0.6);
    });
});
describe("minimizationRound", () => {
    it("should return empty sets", () => {
        const roundResult = minimizationRound([], []);
        expect(roundResult.test.length).to.equal(0);
        expect(roundResult.lastingTests.length).to.equal(0);
        expect(roundResult.lastingActions.length).to.equal(0);
    });
    it("should return the good exploration (start, start)", () => {
        const start = new Action("start");
        const roundResult = minimizationRound([[start]], [start]);
        expect(roundResult.test.length).to.equal(1);
        expect(roundResult.test[0]).to.equal(start);
        expect(roundResult.lastingTests.length).to.equal(0);
        expect(roundResult.lastingActions.length).to.equal(0);
    });
    it("should return the good exploration", () => {
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        const roundResult = minimizationRound([[start, home, end], [start, home], [start]], [start, home]);
        expect(roundResult.test.length).to.equal(2);
        expect(roundResult.test[0]).to.equal(start);
        expect(roundResult.test[1]).to.equal(home);
        expect(roundResult.lastingTests.length).to.equal(2);
        expect(roundResult.lastingActions.length).to.equal(0);
    });
});
describe("computeMinimalExplorationsCoveringAllActions", () => {
    it("should return empty sets", () => {
        const session = new Session("id", "URL", "name", []);
        const minimalExplorations = computeMinimalExplorationsCoveringAllActions(session);
        expect(minimalExplorations.length).to.equal(0);
    });
    it("should return two explorations", () => {
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        const session = new Session("id", "URL", "name", [
            [start, start, end],
            [start, home],
            [home, end],
            [start],
            [end],
            [home, end, end],
        ]);
        const minimalExplorations = computeMinimalExplorationsCoveringAllActions(session);
        expect(minimalExplorations.length).to.equal(2);
        expect(minimalExplorations[0].length).to.equal(2);
        expect(minimalExplorations[0][0]).to.equal(start);
        expect(minimalExplorations[0][1]).to.equal(home);
        expect(minimalExplorations[1].length).to.equal(1);
        expect(minimalExplorations[1][0]).to.equal(end);
    });
});
