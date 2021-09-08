
import Evaluator from "../domain/Evaluator";
import EvaluatorRepository from "../domain/EvaluatorRepository";
import Step from "../domain/Step";
import StepFactory from "./DFAStepFactory";
import { logger } from "../logger";

import {EvaluatorDocument, sequenceEvaluatorModel} from "./EvaluatorSchema";

export default class SequenceEvaluatorRepositoryMongo implements EvaluatorRepository {

    public getSequenceEvaluatorByWebSiteId(sessionId: string, stepFactory: StepFactory): Promise<Evaluator> {
        let evaluator: Evaluator;
        return sequenceEvaluatorModel.findOne({sessionId: sessionId})
            .then((sequenceEvaluatorData: EvaluatorDocument | null) => {
                if (sequenceEvaluatorData !== null) {
                    logger.info(`Evaluator found, ${sequenceEvaluatorData}`)
                        return stepFactory.createStep(sequenceEvaluatorData.expression)
                            .then((step: Step) => {
                                evaluator = new Evaluator(sequenceEvaluatorData.sessionId, step, sequenceEvaluatorData._id, sequenceEvaluatorData.description);
                                return evaluator;
                             })
                } else {
                    throw new Error(`Evaluator not found for website ${sessionId}`);
                }
            })
    }

    public createSequenceEvaluator(sessionId: string, description: string, stepFactory: StepFactory, expression: string): Promise<Evaluator> {
        let evaluator: Evaluator;
        return sequenceEvaluatorModel.create({
            sessionId: sessionId,
            expression,
            description,
        } as EvaluatorDocument)
        .then((evaluatorCreated: EvaluatorDocument) => {
            return stepFactory.createStep(expression).then((step: Step) => {
                evaluator = new Evaluator(evaluatorCreated.sessionId, step, evaluatorCreated._id, evaluatorCreated.description);
                return evaluator;
            });
        });
    }

    public updateSequenceEvaluator(sessionId: string, description: string, expression: string): Promise <void> {
        if (expression.length === 0) {
            return Promise.reject("Expression cannot be empty")
        }
        return sequenceEvaluatorModel.updateOne({
            sessionId: sessionId,
        }, {
            description,
            expression,
        }).then(() => {return})
    }

    public removeSequenceEvaluator(sessionId: string): Promise<void> {
        return sequenceEvaluatorModel.remove({sessionId}).then(() => {return})
    }
}
