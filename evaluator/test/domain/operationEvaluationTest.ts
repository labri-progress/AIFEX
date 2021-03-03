import chai = require("chai");
const expect = chai.expect;
import "mocha";
import AntlrStepParser from "../../src/_infra/AntlrStepParser";
import InteractionFactory from "../../src/domain/InteractionFactory";
import SequenceEvaluator from "../../src/domain/SequenceEvaluator";
import StepFactory from "../../src/domain/StepFactory";
import SequenceEvaluation from "../../src/domain/SequenceEvaluation";
import Step from "../../src/domain/Step";

const stepParser = new AntlrStepParser();
const stepFactory = new StepFactory(stepParser);
describe("Domain - SequenceEvaluator", () => {
    describe("Simple Action", () => {

        describe("Action", () => {

            const text = "action1"
            let evaluator: SequenceEvaluator;
            let webSiteId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                evaluator = new SequenceEvaluator(webSiteId);
                return stepFactory.createStep(text).then((step: Step | undefined) => {
                        if (step === undefined) {
                            throw("step is undefined");
                        }
                        evaluator.setStep(step);
                        return;
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    InteractionFactory.parseInteraction("action1"),
                ];
                
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })

        describe("Action with suffix", () => {
            const text = "action1$mySuffix"
            let evaluator: SequenceEvaluator;
            let webSiteId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                evaluator = new SequenceEvaluator(webSiteId);
                return stepFactory.createStep(text)
                    .then((createdStep: Step | undefined) => {
                        if (!createdStep) {
                            throw new Error("Step is undefined")
                        }
                        step = createdStep;

                        evaluator.setStep(step);
                        return
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    InteractionFactory.parseInteraction("action1$mySuffix"),
                ];
                
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })

        describe("Action with simple quote suffix", () => {
            const text = "action1$'my Suffix'"
            let evaluator: SequenceEvaluator;
            let webSiteId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                evaluator = new SequenceEvaluator(webSiteId);
                return stepFactory.createStep(text)
                    .then((createdStep: Step | undefined) => {
                        if (!createdStep) {
                            throw new Error("Step is undefined")
                        }
                        step = createdStep;

                        evaluator.setStep(step);
                        return;
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    InteractionFactory.parseInteraction("action1$my Suffix"),
                ];
                
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })
    })

    describe("Action with double quote suffix", () => {
        const text = "action1$\"my Suffix\""
        let evaluator: SequenceEvaluator;
        let webSiteId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            evaluator = new SequenceEvaluator(webSiteId);
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (createdStep === undefined) {
                        throw("step is undefined");
                    }
                    step = createdStep;

                    evaluator.setStep(step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("action1$my Suffix"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })

    })

    describe("KleenPlus", () => {
        const text = "(clickButton1 or clickButton2)+ clickButton3"
        let evaluator: SequenceEvaluator;
        let webSiteId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            evaluator = new SequenceEvaluator(webSiteId);
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (!createdStep) {
                        throw new Error("step is undefined")
                    }
                    step = createdStep;
                    evaluator.setStep(step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })

        it ("Invalid sequence 1", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton1"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton3"),
                InteractionFactory.parseInteraction("clickButton3")
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })
    })

    describe("Iteration", () => {

        const text = "(clickButton1 or clickButton2)[2] clickButton3"
        let evaluator: SequenceEvaluator;
        let webSiteId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            evaluator = new SequenceEvaluator(webSiteId);
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (!createdStep) {
                        throw new Error("step is undefined")
                    }
                    step = createdStep;

                    evaluator.setStep(step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)

            })
        })
        it ("Valide sequence 2", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton2"),
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })
        it ("Invalid sequence 1", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton1"),
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton2"),
                InteractionFactory.parseInteraction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 3", () => {
            const interactionList = [
                InteractionFactory.parseInteraction("clickButton2"),
                InteractionFactory.parseInteraction("clickButton2"),
                InteractionFactory.parseInteraction("clickButton2"),
                InteractionFactory.parseInteraction("clickButton3")
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })
    })

   
})