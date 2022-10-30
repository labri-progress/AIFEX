import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import EventGraph from "../../src/domain/EventGraph";


describe("EventGraph", () => {
    it("build a graph with nothing (root will be added)", () => {
        const g = new EventGraph();
        const matrix = g.adjMatrix;
        expect(matrix.length).to.equal(1);
        expect(matrix[0].length).to.equal(1);
        expect(matrix[0][0]).to.equal(true);
    });
    it("build a graph add Exploration [start , end]", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const end = new Action("end");
        g.addExploration([start, end]);
        const matrix = g.adjMatrix;
        expect(matrix.length).to.equal(3);
        expect(matrix[0].length).to.equal(2);
        expect(matrix[0][0]).to.equal(true);
        expect(matrix[0][1]).to.equal(true);
        expect(matrix[0][3]).to.equal(undefined);
        expect(matrix[1].filter(v => v === true).length).to.equal(2);
        expect(matrix[1][0]).to.equal(undefined);
        expect(matrix[1][1]).to.equal(true);
        expect(matrix[1][2]).to.equal(true);
        expect(matrix[2].filter(v => v === true).length).to.equal(1);
        expect(matrix[2][0]).to.equal(undefined);
        expect(matrix[2][1]).to.equal(undefined);
        expect(matrix[2][2]).to.equal(true);
    });
    it("build a graph with [start,  home,  end] and [start, end]", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        g.addExploration([start, home, end]);
        g.addExploration([start, end]);
        const matrix = g.adjMatrix;
        expect(matrix.length).to.equal(4);
        expect(matrix[0].filter(v => v === true).length).to.equal(2);
        expect(matrix[1][1]).to.equal(true);
        expect(matrix[1][2]).to.equal(true);
        expect(matrix[2][2]).to.equal(true);
    });
});
describe("indexes and actions", () => {
    it("should return the good indexes", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        g.addExploration([start, home, end]);
        g.addExploration([start, end]);
        const indexes = g.indexes;
        expect(indexes.size).to.equal(4);
        expect(indexes.get("start")).to.equal(1);
        expect(indexes.get("home")).to.equal(2);
        expect(indexes.get("end")).to.equal(3);
        const actions = g.actions;
        expect(actions.size).to.equal(4);
        expect(actions.get(1)?.kind).to.equal(start.kind);
        expect(actions.get(2)?.kind).to.equal(home.kind);
        expect(actions.get(3)?.kind).to.equal(end.kind);
    });
});
describe("EventGraph dijkstra", () => {
    it("return dijkstra path with 3 nodes", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const home = new Action("home");
        const end = new Action("end");
        g.addExploration([start, home, end]);
        g.addExploration([start, end]);
        const path = g.dijkstra(start, end);
        expect(path.length).to.equal(2);
        expect(path[0].kind).to.equal("start");
        expect(path[1].kind).to.equal("end");
    });
    it("return dijkstra path with 5 nodes", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const home = new Action("home");
        const buy = new Action("buy");
        const find = new Action("find");
        const end = new Action("end");
        g.addExploration([start, home, end]);
        g.addExploration([start, home, buy, end]);
        g.addExploration([start, home, find, buy, end]);
        
        const path = g.dijkstra(start, end);
        expect(path.length).to.equal(3);
        expect(path[0].kind).to.equal("start");
        expect(path[1].kind).to.equal("home");
        expect(path[2].kind).to.equal("end");
    });
});
describe("ShortPath", () => {
    it("return dijkstra path with 5 nodes", () => {
        const g = new EventGraph();
        const start = new Action("start");
        const home = new Action("home");
        const buy = new Action("buy");
        const find = new Action("find");
        const end = new Action("end");
        g.addExploration([start, home, end]);
        g.addExploration([start, home, buy, end]);
        g.addExploration([start, home, find, buy, end]);
        
        const path = g.shortPathToTarget(end);
        expect(path.length).to.equal(3);
        expect(path[0].kind).to.equal("start");
        expect(path[1].kind).to.equal("home");
        expect(path[2].kind).to.equal("end");

        const path2 = g.shortPathToTarget(home);
        expect(path2.length).to.equal(2);
        expect(path2[0].kind).to.equal("start");
        expect(path2[1].kind).to.equal("home");
    });
})