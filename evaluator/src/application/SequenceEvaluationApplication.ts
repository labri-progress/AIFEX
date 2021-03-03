
import InteractionFactory from "../domain/InteractionFactory";
import IStepParser from "../domain/IStepParser";
import SequenceEvaluation from "../domain/SequenceEvaluation";
import SequenceEvaluator from "../domain/SequenceEvaluator";
import SequenceEvaluatorRepository from "../domain/SequenceEvaluatorRepository";
import StepFactory from "../domain/StepFactory";

export default class SequenceEvaluationApplication {

    public sequenceEvaluatorRepository: SequenceEvaluatorRepository;
    private stepFactory: StepFactory;

    constructor(sequenceEvaluatorRepository: SequenceEvaluatorRepository, stepParser: IStepParser) {
        this.sequenceEvaluatorRepository = sequenceEvaluatorRepository;
        this.stepFactory = new StepFactory(stepParser);
    }

    public createSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise<void> {

        return this.sequenceEvaluatorRepository.createSequenceEvaluator(webSiteId, description, this.stepFactory, expression)
            .then((_sequenceEvaluator) => {return; });
    }

    public updateSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise<void> {
        return this.sequenceEvaluatorRepository.updateSequenceEvaluator(webSiteId, description, expression)
        .then(() => {return; });
    }

    public removeSequenceEvaluator(webSiteId: string): Promise<void> {
        return this.sequenceEvaluatorRepository.removeSequenceEvaluator(webSiteId)
    }

    public getSequenceEvaluator(webSiteId: string): Promise<SequenceEvaluator | undefined> {
        if (webSiteId === undefined || webSiteId === null) {
            return Promise.resolve(undefined);
        }
        return this.sequenceEvaluatorRepository.getSequenceEvaluatorByWebSiteId(webSiteId, this.stepFactory)
            .then((evaluator) => {
                return evaluator;
            });
    }

    public evaluateSequence(webSiteId: string, sequence: string[]): Promise<SequenceEvaluation | null> {
        const interactionList = sequence.map((interactionText) => InteractionFactory.parseInteraction(interactionText));
        return this.sequenceEvaluatorRepository.getSequenceEvaluatorByWebSiteId(webSiteId, this.stepFactory)
        .then((evaluator) => {
            if (!evaluator) {
                return null;
            }
            return evaluator.evaluate(interactionList);
        });

    }

    public evaluateFromExpression(expression: string, interactionList: string[]) : Promise<boolean | void> {
        const evaluator = new SequenceEvaluator("evaluator", "0");

        return this.stepFactory.createStep(expression).then(step => {
            if (step === undefined) {
                throw new Error("Failed to create step");
            } else {
                evaluator.setStep(step);
            }
            const interactions = interactionList.map(interaction => {
                const [prefix, suffix] = interaction.split("$");
                return InteractionFactory.createAction(prefix, suffix)
            })
            return evaluator.evaluate(interactions)
        }).then((evaluation) => {
            return evaluation.isAccepted;
        })
    }


    public checkExpressionValidity(expression: string): Promise<boolean> {
        return this.stepFactory.checkExpressionValidity(expression)
    }


    public expressionToDot(expression: string): Promise<string | null> {
        return this.stepFactory.createStep(expression).then((step) => {
            if (step?.stepDFA) {
                return step.stepDFA.toDot("Expression");
            }
            return null;
        })
    }

}
