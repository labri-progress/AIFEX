import PrintService from "../application/PrintService";

import { Request, Express, Response } from "express";
import {logger} from "../logger";

const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app : Express, printService: PrintService): void {

    app.get("/printer/ping", (req : Request, res : Response) => {
        logger.info(`ping`);
        res.send("alive");
    });

    app.post("/printer/print/natural:sessionId", (req, res) => {
        const {sessionId} = req.params;
        logger.info(`print session ${sessionId} in natural`);

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }

        printService.printSession(sessionId)
        .then((print) => {
            if (print) {
                res.send({print});
            } else {
                logger.debug(`print return undefined`);
                res.status(NOT_FOUND_STATUS).send();
            }           
        })
        .catch( (e) => {
            logger.error(e);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
        });
    });

    app.post("/printer/print/puppeteer/", (req, res) => {
        const {sessionId, headless, timeout} = req.body;
        logger.info(`print session ${sessionId} in puppeter`);

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }

        printService.printPuppeteerSession(sessionId, {headless, timeout})
        .then((print) => {
            if (print) {
                res.send({print});
            } else {
                logger.debug(`print return undefined`);
                res.status(NOT_FOUND_STATUS).send();
            }
        })
        .catch( (e) => {
            logger.error(e);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
        });
    });

}
