
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

    app.get("/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });


    app.post("/signin", (req, res) => {
        const {username, password} = req.body;
        logger.info(`signin`);
        if (username === undefined) {
            logger.warn(`no username`);
        }
        if (password === undefined) {
            logger.warn(`no password`);
        }
        if (password === undefined || username === undefined) {
            res.status(INVALID_PARAMETERS_STATUS).send("No username or no password");
        } else {
            accountService.signin(username, password)
            .then(tokenResult => {
                if (tokenResult === "Unauthorized") {
                    res.status(FORBIDDEN_STATUS).send("Unauthorized");
                } else {
                    logger.info("signin done");
                    res.json({"bearerToken":tokenResult.token});
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
            });
        }
    });

    app.get("/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        logger.info(`webSites by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(INVALID_PARAMETERS_STATUS).send("No token");
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(INVALID_PARAMETERS_STATUS).send("No webSiteId");
            } else {
                webSiteService.getWebSiteById(req.token, webSiteId)
                .then(webSiteResult => {
                    if (webSiteResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).send("Unauthorized");
                    } else {
                        logger.info("webSites by Id done");
                        res.json(webSiteResult);
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
                });
            }
        }
    });

    app.get("/websites", (req, res) => {
        logger.info(`websites`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(INVALID_PARAMETERS_STATUS).send("No token");
        } else {
            webSiteService.getWebSiteIds(req.token)
            .then(idsResult => {
                if (idsResult === "Unauthorized") {
                    res.status(FORBIDDEN_STATUS).send("Unauthorized");
                } else {
                    logger.info("websites done");
                    res.json(idsResult);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
            });
        }
    });

    app.get("/sessions/:sessionId", (req, res) => {
        const sessionId = req.params.sessionId;
        logger.info(`Session By Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(INVALID_PARAMETERS_STATUS).send("No token");
        } else {
            if (sessionId === undefined) {
                logger.warn(`sessionId`);
                res.status(INVALID_PARAMETERS_STATUS).send("No sessionId");
            } else {
                sessionService.getSessionById(req.token, sessionId)
                .then(sessionResult => {
                    if (sessionResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).send("Unauthorized");
                    } else {
                        logger.info("Session by Id done");
                        res.json(sessionResult);
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
                });
            }
        }
    });

    app.get("/sessions", (req, res) => {
        logger.info(`sessions`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(INVALID_PARAMETERS_STATUS).send("No token");
        } else {
            sessionService.getSessionIds(req.token)
            .then(idsResult => {
                if (idsResult === "Unauthorized") {
                    res.status(FORBIDDEN_STATUS).send("Unauthorized");
                } else {
                    logger.info("sessions done");
                    res.json(idsResult);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
            });
        }
    });


    



}
