
import SequenceEvaluator from "../domain/SequenceEvaluator";
import SequenceEvaluatorRepository from "../domain/SequenceEvaluatorRepository";
import Step from "../domain/Step";
import StepFactory from "../domain/StepFactory";
import { logger } from "../logger";

import {EvaluatorDocument, sequenceEvaluatorModel} from "./SequenceEvaluatorSchema";

export default class SequenceEvaluatorRepositoryMongo implements SequenceEvaluatorRepository {

    public getSequenceEvaluatorByWebSiteId(webSiteId: string, stepFactory: StepFactory): Promise<SequenceEvaluator | undefined> {
        let evaluator: SequenceEvaluator;
        return sequenceEvaluatorModel.findOne({webSiteId})
            .then((sequenceEvaluatorData: EvaluatorDocument | null) => {
                if (sequenceEvaluatorData !== null) {
                    logger.info(`Evaluator found, ${sequenceEvaluatorData}`)
                    evaluator = new SequenceEvaluator(sequenceEvaluatorData.webSiteId, sequenceEvaluatorData._id, sequenceEvaluatorData.description);
                    if (sequenceEvaluatorData.expression !== undefined) {
                        return stepFactory.createStep(sequenceEvaluatorData.expression)
                            .then((step: Step | undefined) => {
                                if (!evaluator) {
                                    return undefined;
                                }
                                evaluator.step = step;
                                return evaluator;
                             })
                    } else {
                        return evaluator;
                    }
                } else {
                    logger.info(`Evaluator not found for website ${webSiteId}`)
                    return undefined;
                }
            })
            .catch((error) => {
                logger.error(`Error getSequenceEvaluatorByWebSiteId : ${error}`)
                return undefined;
            })
    }

    public createSequenceEvaluator(webSiteId: string, description: string, stepFactory: StepFactory, expression: string): Promise<SequenceEvaluator> {
        let evaluator: SequenceEvaluator
        return sequenceEvaluatorModel.create({
            webSiteId,
            expression,
            description,
        } as EvaluatorDocument)
        .then((createdSequenceEvaluator: EvaluatorDocument) => {
            evaluator = new SequenceEvaluator(createdSequenceEvaluator.webSiteId, createdSequenceEvaluator._id, createdSequenceEvaluator.description);
            return stepFactory.createStep(createdSequenceEvaluator.expression)
        }).then((step: Step | undefined) => {
            evaluator.step = step;
            return evaluator;
        })
    }

    public updateSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise <void> {
        if (expression.length === 0) {
            return Promise.reject("Expression cannot be empty")
        }
        return sequenceEvaluatorModel.updateOne({
            webSiteId,
        }, {
            description,
            expression,
        }).then(() => {return})
    }

    public removeSequenceEvaluator(webSiteId: string): Promise<void> {
        return sequenceEvaluatorModel.remove({webSiteId}).then(() => {return})
    }
}
