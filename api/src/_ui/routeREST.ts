import { Application } from 'express';
import { logger } from "../logger";
import Token from "../domain/Token";
import APIApplication from '../application/APIApplication';

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app : Application, api : APIApplication) {

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
            api.signin(username, password)
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
            res.status(FORBIDDEN_STATUS).send("No token");
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(INVALID_PARAMETERS_STATUS).send("No webSiteId");
            } else {
                api.findWebSiteById(req.token, webSiteId)
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
        logger.info(`get websites`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).send("No token");
        } else {
            api.findWebSiteIds(req.token)
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

    app.post("/websites", (req, res) => {
        logger.info(`create websites`);
        const {name, url, mappingList} = req.body;
        logger.debug(`${mappingList}`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).send("No token");
        } else {
            const token : Token = req.token;
            if (name === undefined || url === undefined || mappingList === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).send("invalid parameter");
            } else {
                api.createWebSite(req.token,name, url, mappingList)
                .then(newToken => {
                    if (newToken === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).send("Unauthorized");
                    } else {
                        logger.info("website is created and added");
                        res.json({jwt:token.token});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({error:e});
                });
            }
        }
    });

    app.get("/sessions/:sessionId", (req, res) => {
        const sessionId = req.params.sessionId;
        logger.info(`Session By Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).send("No token");
        } else {
            if (sessionId === undefined) {
                logger.warn(`sessionId`);
                res.status(INVALID_PARAMETERS_STATUS).send("No sessionId");
            } else {
                api.findSessionById(req.token, sessionId)
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
            res.status(FORBIDDEN_STATUS).send("No token");
        } else {
            api.findSessionIds(req.token)
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
