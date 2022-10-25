import { Express } from "express";
import GeneratorService from "../application/GeneratorService";
import { logger } from "../logger";
import ejs from "ejs";
import * as path from "path";

const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Express, generatorService: GeneratorService): void {

    app.get("/generator/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.get("/generator/session/:sessionId/all-actions", (req, res) => {
        logger.info(`generate tests that cover all actions for session ${req.params.sessionId}`);
        generatorService.createTestsThatCoverAllActions(req.params.sessionId)
        .then(tests => {
            if (tests === undefined) {
                res.status(NOT_FOUND_STATUS).json({message:"Session not found"});
            } else {
                logger.debug(__dirname);
                ejs.renderFile(path.join(__dirname,"/../domain/views/testSuite.ejs"), {tests}, {}, (err, str) => {
                    logger.debug(`rendered ${str}`);
                    if (err) {
                        console.log(err);
                        logger.error(err);
                    }
                    res.json({tests: str, sessionId: req.params.sessionId});
                });
                
            }
        }).catch(err => {
            logger.error(err);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send(err);
        });
    });

}

