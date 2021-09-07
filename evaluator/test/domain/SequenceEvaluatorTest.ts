import chai = require("chai");
const expect = chai.expect;
import "mocha";
import AntlrStepParser from "../../src/_infra/AntlrStepParser";
import Action from "../../src/domain/Action";
import Evaluator from "../../src/domain/Evaluator";
import StepFactory from "../../src/_infra/DFAStepFactory";
import Step from "../../src/domain/Step";

describe("Domain - SequenceEvaluator", () => {

    const stepParser = new AntlrStepParser();
    const stepFactory = new StepFactory(stepParser);

    describe("Evaluator", () => {
        let evaluator: Evaluator;

        before("create evaluator", () => {
            const stepText = "(clickSearchBar typeProductName clickOnSearchButton) or (clickSearchBar typeProductName pressEnterKey)"
            const sessionId = "1";

            return stepFactory.createStep(stepText).then((step) => {
                if (step === undefined) {
                    throw("step is undefined");
                }
                evaluator = new Evaluator(sessionId, step);
                return;
            })
        });

        describe("evaluate a sequence that do not start the step ", () => {
            it("should have an entering action and not continuing action", () => {
                const interactions = [Action.labelToAction("start")];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.nextActionList).to.eql([new Action("clickSearchBar")]);
                    expect(evaluation.isAccepted).to.eql(false);
                });
            });
        });

        describe("evaluate a not finished step", () => {
            it("should have a continuing action", () => {
                const interactions = [
                    Action.labelToAction("start"),
                    Action.labelToAction("clickSearchBar"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.nextActionList).to.eql([new Action("typeProductName")]);
                    expect(evaluation.isAccepted).eql(false);
                });
            });
        });

        describe("evaluate a sequence leading to the finishing action", () => {
            it("should have a finishing action", () => {
                const interactions = [
                    Action.labelToAction("start"),
                    Action.labelToAction("clickSearchBar"),
                    Action.labelToAction("typeProductName"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.nextActionList).to.eql([]);
                    expect(evaluation.isAccepted).eql(false);
                });
            });
        });



        describe("evaluate a sequence with an invalid action before finishing the step", () => {
            it("should have a finishing action", () => {
                const interactions = [
                    Action.labelToAction("start"),
                    Action.labelToAction("clickSearchBar"),
                    Action.labelToAction("typeProductName"),
                    Action.labelToAction("wrongAction"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.nextActionList).to.eql([]);
                    expect(evaluation.isAccepted).to.eql(false);
                });
            });
        });
    });

    describe("Evaluate", () => {
        let evaluator: Evaluator;
        const stepList: Step[] = [];

        before("create evaluator", () => {
            const stepText = "Click AddToBask";
            const sessionID = "1";

            return stepFactory.createStep(stepText).then((step) => {
                if (step === undefined) {
                    throw("step is undefined");
                }
                stepList.push(step);
                evaluator = new Evaluator(sessionID, step);
                return;
            });
        });

        it ("match first action, then invalidated, then validate again", () => {
            const interactions = [
                Action.labelToAction("Click"),
                Action.labelToAction("AddToBask"),
            ];
            return evaluator.evaluate(interactions).then((evaluation) => {
                expect(evaluation.nextActionList).to.eql([]);
                expect(evaluation.isAccepted).to.eql(true);
            });
        });

        it ("match first action, then invalidated, then validate again", () => {
            const interactions = [
                Action.labelToAction("start"),
                Action.labelToAction("Click"),
                Action.labelToAction("Search"),
                Action.labelToAction("Click"),
                Action.labelToAction("AddToBask"),
            ];
            return evaluator.evaluate(interactions).then((evaluation) => {
                expect(evaluation.nextActionList).to.eql([]);
                expect(evaluation.isAccepted).to.eql(true);
            });
        });
    });

});
