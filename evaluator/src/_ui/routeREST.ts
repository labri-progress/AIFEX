import ObjectiveService from "../application/EvaluationApplication";
import {Express} from "express";
import Evaluator from "../domain/Evaluator";
import {logger} from "../logger";
import Evaluation from "../domain/Evaluation";
import Action from "../domain/Action";

const SUCCESS_STATUS = 200;
const STATUS_REPONSE_IS_NULL = 204;
const STATUS_WRONG_PARAMETERS = 400;
const ERROR_STATUS = 500;

export default function attachRoutes(app: Express, evaluatorService: ObjectiveService): void {

    app.get("/ping", (req, res) => {
        logger.info("ping");
        res.send("alive");
    });

    app.get("/evaluator/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`getEvaluator for sessionId ${sessionId}`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }
        evaluatorService.getEvaluator(sessionId)
            .then((evaluator: Evaluator | "noEvaluatorForSession") => {
                if (evaluator === "noEvaluatorForSession") {
                    logger.info(`no evaluator found for session ${sessionId}`);
                    return res.sendStatus(STATUS_REPONSE_IS_NULL)
                }
                else {
                    logger.info(`sending evaluator ${evaluator.id} for website ${evaluator.sessionId}`);

                    return res.send({
                        id: evaluator.id,
                        description: evaluator.description,
                        expression: evaluator.step?.expression,
                        sessionId: evaluator.sessionId
                    })
                }
            })
            .catch((error: Error) => {
                logger.error(`getEvaluator error for sessionId ${sessionId}: ${error}`);
                return res.status(ERROR_STATUS).send(error);
        });
    })

    app.post("/evaluator/create", (req, res) => {
        const { sessionId, description, expression } = req.body;
        logger.info(`create evaluator (sessionId:${sessionId}, description: ${description}, expression: ${expression})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }
        if (typeof expression === undefined) {
            logger.warn(`expression is required`);
            return res.status(STATUS_WRONG_PARAMETERS).send("expression is required");
        }
        if (typeof description === undefined) {
            logger.warn(`description is required`);
            return res.status(STATUS_WRONG_PARAMETERS).send("description is required");
        }

        if (expression.length === 0) {
            logger.warn(`expression must not be empty`);
            return res.status(STATUS_WRONG_PARAMETERS).send("expression must not be empty");
        }
        evaluatorService.createEvaluator(sessionId, description, expression).then(() => {
            logger.debug("evaluator is created")
            return res.sendStatus(SUCCESS_STATUS);
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/update/:sessionId", (req, res) => {
        const { sessionId } = req.params
        const { description, expression } = req.body;
        logger.info(`update evaluator (sessionId:${sessionId}, description: ${description}, expression: ${expression})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }
        evaluatorService.updateEvaluator(sessionId, description, expression).then(() => {
            logger.debug("evaluator is updated")
            return res.sendStatus(SUCCESS_STATUS);
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });


    app.post("/evaluator/evaluate", (req, res) => {
        const { sessionId, actionList } = req.body;
        logger.info(`evaluate sequence (sessionId : ${sessionId}, actionList : ${JSON.stringify(actionList)})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }
        if (!Array.isArray(actionList)) {
            logger.warn("actionList must be an array")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }

        evaluatorService.evaluateSequence(
            sessionId, 
            actionList.map(actionData => new Action(actionData.prefix, actionData.suffix))
            ).then((evaluation: Evaluation) => {
            return res.status(SUCCESS_STATUS).send({evaluation});
        }).catch((error) => {
            logger.error(error);actionList
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/evaluate-expression", (req, res) => {
        const { expression, actionList } = req.body;
        logger.info(`evaluate sequence (expression : ${expression}, actionList : ${JSON.stringify(actionList)})`);
        if (expression === undefined) {
            logger.warn("expression is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("expression is required");
        }
        if (!Array.isArray(actionList)) {
            logger.warn("actionList must be an array")
            return res.status(STATUS_WRONG_PARAMETERS).send("actionList muse be an array");
        }

        evaluatorService.evaluateSequenceByExpression (
            expression, 
            actionList.map(actionData => new Action(actionData.prefix, actionData.suffix))
            ).then((evaluation: Evaluation) => {
            return res.status(SUCCESS_STATUS).send({evaluation});
        }).catch((error: Error) => {
            logger.error(error);actionList
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/remove/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`remove evaluator for (sessionId : ${sessionId})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("sessionId is required");
        }
        evaluatorService.removeEvaluator(sessionId)
        .then(() => {
            return res.sendStatus(SUCCESS_STATUS)
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });


    app.post("/evaluator/expressionToDot", (req, res) => {
        const { expression } = req.body;
        logger.info(`expression to do : ${expression}`);
        if (!expression) {
            logger.warn("expression parameter is required", expression)
            return res.status(ERROR_STATUS).send("Invalid parameters");
        }
        evaluatorService.checkExpressionValidity(expression).then(expressionIsValid => {
            if (!expressionIsValid) {
                return res.status(SUCCESS_STATUS).send({
                    expressionIsValid: false,
                    dot: undefined
                })
            } else {
                evaluatorService.expressionToDot(expression).then((dot) => {
                    return res.status(SUCCESS_STATUS).send({
                        expressionIsValid: true,
                        dot
                    })
                })
            }
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    })

}
