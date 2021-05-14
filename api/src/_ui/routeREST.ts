
import AccountService from "../domain/AccountService";
import SessionService from "../domain/SessionService";
import WebSiteService from "../domain/WebSiteService";
import { Application } from 'express';
import { logger } from "../logger";

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app : Application, accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService) {

    app.get("/api/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });


    app.post("/api/signin", (req, res) => {
        const {username, password} = req.body;
        logger.info(`signin`);
        if (username === undefined) {
            logger.warn(`no username`);
        }
        if (password === undefined) {
            logger.warn(`no password`);
        }
        if (password === undefined || username === undefined) {
            res.status(403).send("No username or no password");
        } else {
            accountService.signin(username, password)
            .then(tokenResult => {
                if (tokenResult === "Unauthorized") {
                    res.status(403).send("Unauthorized");
                } else {
                    logger.info("signin done");
                    res.json(tokenResult.token);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(403).send({error:e});
            });
        }
    });



}
