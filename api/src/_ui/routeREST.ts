
import AccountService from "../domain/AccountService";
import SessionService from "../domain/SessionService";
import WebSiteService from "../domain/WebSiteService";
import { Application } from 'express';
import { logger } from "../logger";
import Token from "../domain/Token"

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

    app.post("/api/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        const {token} = req.body;
        logger.info(`webSites by Id`);
        if (token === undefined) {
            logger.warn(`no token`);
            res.status(403).send("No token");
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(403).send("No webSiteId");
            } else {
                webSiteService.getWebSiteById(new Token(token), webSiteId)
                .then(webSiteResult => {
                    if (webSiteResult === "Unauthorized") {
                        res.status(403).send("Unauthorized");
                    } else {
                        logger.info("webSites by Id done");
                        res.json(webSiteResult);
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(403).send({error:e});
                });
            }
        }
    });

    app.post("/api/websites", (req, res) => {
        const {token} = req.body;
        logger.info(`websites`);
        if (token === undefined) {
            logger.warn(`no token`);
            res.status(403).send("No token");
        } else {
            webSiteService.getWebSiteIds(new Token(token))
            .then(idsResult => {
                if (idsResult === "Unauthorized") {
                    res.status(403).send("Unauthorized");
                } else {
                    logger.info("websites done");
                    res.json(idsResult);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(403).send({error:e});
            });
        }
    });

    app.post("/api/sessions/:sessionId", (req, res) => {
        const sessionId = req.params.sessionId;
        const {token} = req.body;
        logger.info(`Session By Id`);
        if (token === undefined) {
            logger.warn(`no token`);
            res.status(403).send("No token");
        } else {
            if (sessionId === undefined) {
                logger.warn(`sessionId`);
                res.status(403).send("No sessionId");
            } else {
                sessionService.getSessionById(new Token(token), sessionId)
                .then(sessionResult => {
                    if (sessionResult === "Unauthorized") {
                        res.status(403).send("Unauthorized");
                    } else {
                        logger.info("Session by Id done");
                        res.json(sessionResult);
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(403).send({error:e});
                });
            }
        }
    });

    app.post("/api/sessions", (req, res) => {
        const {token} = req.body;
        logger.info(`sessions`);
        if (token === undefined) {
            logger.warn(`no token`);
            res.status(403).send("No token");
        } else {
            sessionService.getSessionIds(new Token(token))
            .then(idsResult => {
                if (idsResult === "Unauthorized") {
                    res.status(403).send("Unauthorized");
                } else {
                    logger.info("sessions done");
                    res.json(idsResult);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(403).send({error:e});
            });
        }
    });


    



}
