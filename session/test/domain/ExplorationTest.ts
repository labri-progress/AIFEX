import chai = require("chai");
const expect = chai.expect;
import "mocha";
import Exploration from "../../src/domain/Exploration";
import Tester from "../../src/domain/Tester";

describe("Domain - Exploration", () => {
    let exploration: Exploration;

    it("should throw error with only tester", () => {
        expect(() => {
            const tester = new Tester("anonymous");
            // tslint:disable-next-line: no-unused-expression
            new Exploration(tester, 0);
        }).to.throw;
    });

    it("should build a Exploration", () => {
        const tester = new Tester("anonymous");
        const explorationNumber = 0;
        exploration = new Exploration(tester, explorationNumber);
        expect(exploration.tester.name).to.equal("anonymous");
    });



});
