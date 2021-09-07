import chai = require("chai");
const expect = chai.expect;
import "mocha";
import AntlrStepParser from "../../src/_infra/AntlrStepParser";
import Evaluator from "../../src/domain/Evaluator";
import StepFactory from "../../src/_infra/DFAStepFactory";
import SequenceEvaluation from "../../src/domain/SequenceEvaluation";
import Step from "../../src/domain/Step";
import Action from "../../src/domain/Action";

const stepParser = new AntlrStepParser();
const stepFactory = new StepFactory(stepParser);
describe("Domain - SequenceEvaluator", () => {
    describe("Simple Action", () => {

        describe("Action", () => {

            const text = "action1"
            let evaluator: Evaluator;
            let sessionId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                return stepFactory.createStep(text).then((step: Step | undefined) => {
                        if (step === undefined) {
                            throw("step is undefined");
                        }
                        evaluator = new Evaluator(sessionId, step);
                        return;
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    Action.labelToAction("action1"),
                ];
                
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })

        describe("Action with suffix", () => {
            const text = "action1$mySuffix"
            let evaluator: Evaluator;
            let sessionId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                return stepFactory.createStep(text)
                    .then((createdStep: Step | undefined) => {
                        if (!createdStep) {
                            throw new Error("Step is undefined")
                        }
                        step = createdStep;
                        evaluator = new Evaluator(sessionId, step);
                        return
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    Action.labelToAction("action1$mySuffix"),
                ];
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })

        describe("Action with simple quote suffix", () => {
            const text = "action1$'my Suffix'"
            let evaluator: Evaluator;
            let sessionId = "1";
            let step: Step; 

            it ("initialize evaluator", () => {
                return stepFactory.createStep(text)
                    .then((createdStep: Step | undefined) => {
                        if (!createdStep) {
                            throw new Error("Step is undefined")
                        }
                        step = createdStep;

                        evaluator = new Evaluator(sessionId, step);
                        return;
                    })
            })

            it ("Valide sequence", () => {
                const interactionList = [
                    Action.labelToAction("action1$my Suffix"),
                ];
                
                return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                    expect(evaluationResult.isAccepted).eql(true)
                })
            })

        })
    })

    describe("Action with double quote suffix", () => {
        const text = "action1$\"my Suffix\""
        let evaluator: Evaluator;
        let sessionId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (createdStep === undefined) {
                        throw("step is undefined");
                    }
                    step = createdStep;

                    evaluator = new Evaluator(sessionId, step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                Action.labelToAction("action1$my Suffix"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })

    })

    describe("KleenPlus", () => {
        const text = "(clickButton1 or clickButton2)+ clickButton3"
        let evaluator: Evaluator;
        let sessionId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (!createdStep) {
                        throw new Error("step is undefined")
                    }
                    step = createdStep;
                    evaluator = new Evaluator(sessionId, step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })

        it ("Invalid sequence 1", () => {
            const interactionList = [
                Action.labelToAction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                Action.labelToAction("clickButton1"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                Action.labelToAction("clickButton3"),
                Action.labelToAction("clickButton3")
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })
    })

    describe("Iteration", () => {

        const text = "(clickButton1 or clickButton2)[2] clickButton3"
        let evaluator: Evaluator;
        let sessionId = "1";
        let step: Step; 

        it ("initialize evaluator", () => {
            return stepFactory.createStep(text)
                .then((createdStep: Step | undefined) => {
                    if (!createdStep) {
                        throw new Error("step is undefined")
                    }
                    step = createdStep;

                    evaluator = new Evaluator(sessionId, step);
                })
        })

        it ("Valide sequence", () => {
            const interactionList = [
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)

            })
        })
        it ("Valide sequence 2", () => {
            const interactionList = [
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton2"),
                Action.labelToAction("clickButton3"),
            ];
            
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(true)
            })
        })
        it ("Invalid sequence 1", () => {
            const interactionList = [
                Action.labelToAction("clickButton1"),
                Action.labelToAction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 2", () => {
            const interactionList = [
                Action.labelToAction("clickButton2"),
                Action.labelToAction("clickButton3"),
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })

        it ("Invalid sequence 3", () => {
            const interactionList = [
                Action.labelToAction("clickButton2"),
                Action.labelToAction("clickButton2"),
                Action.labelToAction("clickButton2"),
                Action.labelToAction("clickButton3")
            ];
            return evaluator.evaluate(interactionList).then((evaluationResult:SequenceEvaluation) => {
                expect(evaluationResult.isAccepted).eql(false)
            })
        })
    })

   
})