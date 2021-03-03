import ObjectiveService from "../application/SequenceEvaluationApplication";
import {Express} from "express";
import SequenceEvaluator from "../domain/SequenceEvaluator";
import {logger} from "../logger";

const SUCCESS_STATUS = 200;
const STATUS_REPONSE_IS_NULL = 204;
const STATUS_WRONG_PARAMETERS = 400;
const ERROR_STATUS = 500;

export default function attachRoutes(app: Express, evaluatorService: ObjectiveService): void {

    app.get("/evaluator/ping", (req, res) => {
        logger.info("ping");
        res.send("alive");
    });

    app.get("/evaluator/getEvaluator/:webSiteId", (req, res) => {
        const { webSiteId } = req.params;
        logger.info(`getEvaluator for webSiteId ${webSiteId}`);
        if (webSiteId === undefined) {
            logger.warn("WebSiteId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("WebSiteId is required");
        }
        evaluatorService.getSequenceEvaluator(webSiteId)
            .then((evaluator: SequenceEvaluator | undefined) => {
                if (!evaluator) {
                    return res.status(STATUS_REPONSE_IS_NULL).send(null);
                }
                logger.info(`sending evaluator ${evaluator.id} for website ${evaluator.webSiteId}`);

            return res.send({
                id: evaluator.id,
                description: evaluator.description,
                expression: evaluator.step?.expression,
                webSiteId: evaluator.webSiteId
            });
        }).catch((error: Error) => {
            logger.error(`getEvaluator error for websiteId ${webSiteId}: ${error}`);
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/create", (req, res) => {
        const { webSiteId, description, expression } = req.body;
        logger.info(`create evaluator (webSiteId:${webSiteId}, description: ${description}, expression: ${expression})`);
        if (webSiteId === undefined) {
            logger.warn("WebSiteId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("WebSiteId is required");
        }
        if (typeof expression !== "string") {
            logger.warn(`expression must be a string`);
            return res.status(STATUS_WRONG_PARAMETERS).send("expression must be a string");
        }

        if (expression.length === 0) {
            logger.warn(`expression must not be empty`);
            return res.status(STATUS_WRONG_PARAMETERS).send("expression must not be empty");
        }
        evaluatorService.createSequenceEvaluator(webSiteId, description, expression).then(() => {
            logger.debug("evaluator is created")
            return res.sendStatus(SUCCESS_STATUS);
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/update", (req, res) => {
        const { webSiteId, description, expression } = req.body;
        logger.info(`update evaluator (webSiteId:${webSiteId}, description: ${description}, expression: ${expression})`);
        if (webSiteId === undefined) {
            logger.warn("WebSiteId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("WebSiteId is required");
        }
        evaluatorService.updateSequenceEvaluator(webSiteId, description, expression).then(() => {
            logger.debug("evaluator is updated")
            return res.sendStatus(SUCCESS_STATUS);
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });


    app.post("/evaluator/evaluateSequence", (req, res) => {
        const { webSiteId, interactionList } = req.body;
        logger.info(`evaluate sequence (webSiteId : ${webSiteId}, interactionList : ${interactionList})`);
        if (webSiteId === undefined) {
            logger.warn("WebSiteId is required")
            return res.status(STATUS_WRONG_PARAMETERS).send("WebSiteId is required");
        }
        if (!Array.isArray(interactionList)) {
            logger.warn("interactionList must be an array")
            return res.status(STATUS_WRONG_PARAMETERS).send("WebSiteId is required");
        }
        evaluatorService.evaluateSequence(webSiteId, interactionList).then((evaluation) => {
            return res.status(SUCCESS_STATUS).send({evaluation});
        }).catch((error) => {
            logger.error(error);
            return res.status(ERROR_STATUS).send(error);
        });
    });

    app.post("/evaluator/evaluateFromExpression", (req, res) => {
        const { expression, interactionList } = req.body;
        logger.info(`evaluate from expression (expression : ${expression}, interactionList : ${interactionList})`);
        if (expression === undefined) {
            logger.warn("invalid parameter expression", expression)
            return res.status(ERROR_STATUS).send("Invalid parameters");
        } if (!Array.isArray(interactionList)) {
            logger.warn("invalid parameter interactionList", interactionList)
            return res.status(ERROR_STATUS).send("Invalid parameters");
        }
        evaluatorService.evaluateFromExpression(expression, interactionList).then((isValid) => {
            return res.status(SUCCESS_STATUS).send({isValid});
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
