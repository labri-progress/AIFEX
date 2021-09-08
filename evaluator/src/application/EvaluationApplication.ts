
import IStepParser from "../domain/IStepParser";
import Evaluation from "../domain/Evaluation";
import Evaluator from "../domain/Evaluator";
import EvaluatorRepository from "../domain/EvaluatorRepository";
import StepFactory from "../_infra/DFAStepFactory";
import StepDFA from "../_infra/StepDFA";
import Action from "../domain/Action";
import DFAStepFactory from "../_infra/DFAStepFactory";

export default class EvaluationApplication {

    public sequenceEvaluatorRepository: EvaluatorRepository;
    private stepFactory: StepFactory;

    constructor(sequenceEvaluatorRepository: EvaluatorRepository, stepParser: IStepParser) {
        this.sequenceEvaluatorRepository = sequenceEvaluatorRepository;
        this.stepFactory = new DFAStepFactory(stepParser);
    }

    public createSequenceEvaluator(sessionId: string, description: string, expression: string): Promise<void> {

        return this.sequenceEvaluatorRepository.createSequenceEvaluator(sessionId, description, this.stepFactory, expression)
            .then((_sequenceEvaluator) => {return; });
    }

    public updateSequenceEvaluator(sessionId: string, description: string, expression: string): Promise<void> {
        return this.sequenceEvaluatorRepository.updateSequenceEvaluator(sessionId, description, expression)
        .then(() => {return; });
    }

    public removeSequenceEvaluator(sessionId: string): Promise<void> {
        return this.sequenceEvaluatorRepository.removeSequenceEvaluator(sessionId)
    }

    public getSequenceEvaluator(sessionId: string): Promise<Evaluator | undefined> {
        if (sessionId === undefined || sessionId === null) {
            return Promise.resolve(undefined);
        }
        return this.sequenceEvaluatorRepository.getSequenceEvaluatorByWebSiteId(sessionId, this.stepFactory)
            .then((evaluator) => {
                return evaluator;
            });
    }

    public evaluateSequence(sessionId: string, sequence: string[]): Promise<Evaluation> {
        const actionList: Action[] = sequence.map((actionLabelList) => Action.labelToAction(actionLabelList));
        return this.sequenceEvaluatorRepository.getSequenceEvaluatorByWebSiteId(sessionId, this.stepFactory)
        .then((evaluator) => {
            return evaluator.evaluate(actionList);
        })

    }

    public evaluateFromExpression(expression: string, actionLabelList: string[]) : Promise<boolean | void> {

        return this.stepFactory.createStep(expression).then(step => {
            if (step === undefined) {
                throw new Error("Failed to create step");
            }
            const evaluator = new Evaluator("evaluator", step, "0");

            const actionSequence = actionLabelList.map(action => {
                return Action.labelToAction(action)
            })
            return evaluator.evaluate(actionSequence)
        }).then((evaluation) => {
            return evaluation.isAccepted;
        })
    }


    public checkExpressionValidity(expression: string): Promise<boolean> {
        return this.stepFactory.checkExpressionValidity(expression)
    }


    public expressionToDot(expression: string): Promise<string | null> {
        return this.stepFactory.createStep(expression).then((step) => {
            if (step !== null) {
                let stepDFA: StepDFA = step as StepDFA;
                return stepDFA.toDot("Expression");
            }
            return null;
        })
    }

}
