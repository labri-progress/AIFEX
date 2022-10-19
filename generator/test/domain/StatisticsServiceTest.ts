import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import Session from "../../src/domain/Session";
import { computeActionsStatistics , getAllActions} from "../../src/domain/StatisticsService";

describe("computeActionsStatistics", () => {
    it("should return an empty map", () => {
        const map = computeActionsStatistics(new Session("id", "baseURL", "name", []));
        expect(map.size).to.equal(0);
    });
    it("should return a map with one entry", () => {
        const start = new Action("start");
        const map = computeActionsStatistics(new Session("id", "baseURL", "name", [[start]]));
        expect(map.size).to.equal(1);
        expect(map.get(start)).to.equal(1);
    });
    it("should return a map with two entries", () => {
        const start = new Action("start");
        const stop = new Action("stop");
        const map = computeActionsStatistics(new Session("id", "baseURL", "name", [[start, stop]]));
        expect(map.size).to.equal(2);
        expect(map.get(start)).to.equal(1);
        expect(map.get(stop)).to.equal(1);
    });
    it("should return a map with two entries and different statistics", () => {
        const start = new Action("start");
        const stop = new Action("stop");
        const map = computeActionsStatistics(new Session("id", "baseURL", "name", [[start, stop], [start]]));
        expect(map.size).to.equal(2);
        expect(map.get(start)).to.equal(2);
        expect(map.get(stop)).to.equal(1);
    });
});
describe("getAllActions", () => {
    it("should return an empty array", () => {
        const actions = getAllActions(new Session("id", "baseURL", "name", []));
        expect(actions.length).to.equal(0);
    });
    it("should return an array with one entry", () => {
        const start = new Action("start");
        const actions = getAllActions(new Session("id", "baseURL", "name", [[start]]));
        expect(actions.length).to.equal(1);
        expect(actions[0]).to.equal(start);
    });
    it("should return an array with two entries", () => {
        const start = new Action("start");
        const stop = new Action("stop");
        const actions = getAllActions(new Session("id", "baseURL", "name", [[start, stop]]));
        expect(actions.length).to.equal(2);
        expect(actions[0]).to.equal(start);
        expect(actions[1]).to.equal(stop);
    });
    it("should return an array with two entries and no duplicates", () => {
        const start = new Action("start");
        const stop = new Action("stop");
        const actions = getAllActions(new Session("id", "baseURL", "name", [[start, stop], [start]]));
        expect(actions.length).to.equal(2);
        expect(actions[0]).to.equal(start);
        expect(actions[1]).to.equal(stop);
    });
});
