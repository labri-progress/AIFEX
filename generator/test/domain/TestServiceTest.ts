import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import Session from "../../src/domain/Session";
import { computeCoverageScore, computeMinimalExplorationsCoveringAllActions, roundForMinimalExplorationsCoveringAllActions} from "../../src/domain/TestService";

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
        expect(score).to.equal(1);
    });
    it("should return 0.5 (start - start, start)", () => {
        const start = new Action("start");
        const score = computeCoverageScore([start, start], [start]);
        expect(score).to.equal(0.5);
    });
});
describe("roundForMinimalExplorationsCoveringAllActions", () => {
    it("should return empty sets", () => {
        const roundResult = roundForMinimalExplorationsCoveringAllActions([], []);
        expect(roundResult.explorationToKeep.length).to.equal(0);
        expect(roundResult.lastExplorations.length).to.equal(0);
        expect(roundResult.lastActionsToCover.length).to.equal(0);
    });
    it("should return the good exploration (start, start)", () => {
        const start = new Action("start");
        const roundResult = roundForMinimalExplorationsCoveringAllActions([[start]], [start]);
        expect(roundResult.explorationToKeep.length).to.equal(1);
        expect(roundResult.explorationToKeep[0]).to.equal(start);
        expect(roundResult.lastExplorations.length).to.equal(0);
        expect(roundResult.lastActionsToCover.length).to.equal(0);
    });
    it("should return the good exploration", () => {
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        const roundResult = roundForMinimalExplorationsCoveringAllActions([[start, home, end], [start, home], [start]], [start, home]);
        expect(roundResult.explorationToKeep.length).to.equal(2);
        expect(roundResult.explorationToKeep[0]).to.equal(start);
        expect(roundResult.explorationToKeep[1]).to.equal(home);
        expect(roundResult.lastExplorations.length).to.equal(2);
        expect(roundResult.lastActionsToCover.length).to.equal(0);
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
