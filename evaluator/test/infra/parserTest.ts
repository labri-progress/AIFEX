import chai = require("chai");
const expect = chai.expect;
import "mocha";
import StepParser from "../../src/_infra/AntlrStepParser";
import Action from "../../src/domain/Action";

describe("Infra - Step parser AST", () => {
    const parser = new StepParser();

   
    it("should build a or", () => {
        const stringTest = "click or search";
        return parser.parseStepExpression(stringTest).then((AST) => {
            expect(AST.label).to.eql("or");
            const left = AST.left.label as Action;
            const right = AST.right.label as Action;

            expect(left.prefix).to.eql("click");
            expect(right.prefix).to.eql("search");
        });
    });

    it("should build a =>", () => {
        const stringTest = "click => search";
        return parser.parseStepExpression(stringTest).then((AST) => {
            expect(AST.label).to.eql("=>");
            const left = AST.left.label as Action;
            const right = AST.right.label as Action;

            expect(left.prefix).to.eql("click");
            expect(right.prefix).to.eql("search");
        });
    });

   
});
