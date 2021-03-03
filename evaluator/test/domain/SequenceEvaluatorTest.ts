import chai = require("chai");
const expect = chai.expect;
import "mocha";
import AntlrStepParser from "../../src/_infra/AntlrStepParser";
import Action from "../../src/domain/Action";
import InteractionFactory from "../../src/domain/InteractionFactory";
import SequenceEvaluator from "../../src/domain/SequenceEvaluator";
import StepFactory from "../../src/domain/StepFactory";
import Step from "../../src/domain/Step";

describe("Domain - SequenceEvaluator", () => {

    const stepParser = new AntlrStepParser();
    const stepFactory = new StepFactory(stepParser);

    describe("Evaluator", () => {
        let evaluator: SequenceEvaluator;

        before("create evaluator", () => {
            const stepText = "(clickSearchBar typeProductName clickOnSearchButton) or (clickSearchBar typeProductName pressEnterKey)"
            const webSiteId = "1";

            evaluator = new SequenceEvaluator(webSiteId);
            return stepFactory.createStep(stepText).then((step) => {
                if (step === undefined) {
                    throw("step is undefined");
                }
                evaluator.setStep(step);
                return;
            })
        });

        describe("evaluate a sequence that do not start the step ", () => {
            it("should have an entering action and not continuing action", () => {
                const interactions = [InteractionFactory.parseInteraction("start")];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.enteringInteractionList).to.eql([new Action("clickSearchBar")]);
                    expect(evaluation.continuingActionList).to.eql([]);
                    expect(evaluation.finishingInteractionList).to.eql([]);
                    expect(evaluation.isAccepted).to.eql(false);
                });
            });
        });

        describe("evaluate a not finished step", () => {
            it("should have a continuing action", () => {
                const interactions = [
                    InteractionFactory.parseInteraction("start"),
                    InteractionFactory.parseInteraction("clickSearchBar"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.enteringInteractionList).to.eql([]);
                    expect(evaluation.continuingActionList).to.eql([new Action("typeProductName")]);
                    expect(evaluation.finishingInteractionList).to.eql([]);
                    expect(evaluation.isAccepted).eql(false);
                });
            });
        });

        describe("evaluate a sequence leading to the finishing action", () => {
            it("should have a finishing action", () => {
                const interactions = [
                    InteractionFactory.parseInteraction("start"),
                    InteractionFactory.parseInteraction("clickSearchBar"),
                    InteractionFactory.parseInteraction("typeProductName"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.enteringInteractionList).to.eql([]);
                    expect(evaluation.continuingActionList).to.eql([]);
                    expect(evaluation.finishingInteractionList).to.eql([new Action("clickOnSearchButton"), new Action("pressEnterKey")]);
                    expect(evaluation.isAccepted).eql(false);
                });
            });
        });



        describe("evaluate a sequence with an invalid action before finishing the step", () => {
            it("should have a finishing action", () => {
                const interactions = [
                    InteractionFactory.parseInteraction("start"),
                    InteractionFactory.parseInteraction("clickSearchBar"),
                    InteractionFactory.parseInteraction("typeProductName"),
                    InteractionFactory.parseInteraction("wrongAction"),
            ];
                return evaluator.evaluate(interactions).then((evaluation) => {
                    expect(evaluation.enteringInteractionList).to.eql([new Action("clickSearchBar")]);
                    expect(evaluation.continuingActionList).to.eql([]);
                    expect(evaluation.finishingInteractionList).to.eql([]);
                    expect(evaluation.isAccepted).to.eql(false);
                });
            });
        });
    });

    describe("Evaluate", () => {
        let evaluator: SequenceEvaluator;
        const stepList: Step[] = [];

        before("create evaluator", () => {
            const stepText = "Click AddToBask";
            const sessionID = "1";

            evaluator = new SequenceEvaluator(sessionID);
            return stepFactory.createStep(stepText).then((step) => {
                if (step === undefined) {
                    throw("step is undefined");
                }
                stepList.push(step);
                evaluator.setStep(step);
                return;
            });
        });

        it ("match first action, then invalidated, then validate again", () => {
            const interactions = [
                InteractionFactory.parseInteraction("Click"),
                InteractionFactory.parseInteraction("AddToBask"),
            ];
            return evaluator.evaluate(interactions).then((evaluation) => {
                expect(evaluation.enteringInteractionList).to.eql([]);
                expect(evaluation.continuingActionList).to.eql([]);
                expect(evaluation.finishingInteractionList).to.eql([]);
                expect(evaluation.isAccepted).to.eql(true);
            });
        });

        it ("match first action, then invalidated, then validate again", () => {
            const interactions = [
                InteractionFactory.parseInteraction("start"),
                InteractionFactory.parseInteraction("Click"),
                InteractionFactory.parseInteraction("Search"),
                InteractionFactory.parseInteraction("Click"),
                InteractionFactory.parseInteraction("AddToBask"),
            ];
            return evaluator.evaluate(interactions).then((evaluation) => {
                expect(evaluation.enteringInteractionList).to.eql([]);
                expect(evaluation.continuingActionList).to.eql([]);
                expect(evaluation.finishingInteractionList).to.eql([]);
                expect(evaluation.isAccepted).to.eql(true);
            });
        });
    });

});
