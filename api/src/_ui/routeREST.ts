import { Application } from 'express';
import { logger } from "../logger";
import Token from "../domain/Token";
import APIApplication from '../application/APIApplication';

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Application, api: APIApplication) {

    app.get("/ping", (req, res) => {
        logger.info(`ping`);
        res.json({message:'alive'});
    });

    app.post("/signup", (req, res) => {
        const { username, email, password } = req.body;
        logger.info(`signup`);
        if (username === undefined) {
            logger.warn(`no username`);
        }
        if (email === undefined) {
            logger.warn(`no email`);
        }
        if (password === undefined) {
            logger.warn(`no password`);
        }
        if (password === undefined || email === undefined || username === undefined) {
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No username, email or password"});
        } else {
            api.signup(username, email, password)
                .then(result => {
                    if (result === "UserNameAlreadyTaken") {
                        res.status(FORBIDDEN_STATUS).json({message:result});
                    } else {
                        logger.info("account created");
                        res.json({message:result});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
    });

    app.post("/signin", (req, res) => {
        const { username, password } = req.body;
        logger.info(`signin`);
        if (username === undefined) {
            logger.warn(`no username`);
        }
        if (password === undefined) {
            logger.warn(`no password`);
        }
        if (password === undefined || username === undefined) {
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No username or no password"});
        } else {
            api.signin(username, password)
                .then(tokenResult => {
                    if (tokenResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("signin done");
                        res.json({ "bearerToken": tokenResult.token });
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
    });

    app.get("/account", (req, res) => {
        logger.info(`GET Account`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({messag:"No token"});
        } else {
            api.getAccount(req.token)
                .then(accountResult => {
                    if (accountResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("return account");
                        logger.debug(`account: ${JSON.stringify(accountResult)}`);
                        res.json({
                            username: accountResult.username,
                            authorizationSet: accountResult.authorizationSet.map(auth => {
                                return {
                                    kind: auth.kind,
                                    key: auth.key
                                }
                            })
                        });
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });

        }
    });

    app.get("/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        logger.info(`webSites by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No webSiteId"});
            } else {
                api.findWebSiteById(req.token, webSiteId)
                    .then(webSiteResult => {
                        if (webSiteResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("webSites by Id done");
                            res.json(webSiteResult);
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.post("/websites", (req, res) => {
        logger.info(`create websites`);
        const { name, url, mappingList } = req.body;
        logger.debug(`${mappingList}`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token: Token = req.token;
            if (name === undefined || url === undefined || mappingList === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"invalid parameter"});
            } else {
                api.createWebSite(req.token, name, url, mappingList)
                    .then(creationResult => {
                        if (creationResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:creationResult});
                        } else {
                            logger.info("website is created and added");
                            res.json({webSiteId:creationResult.id});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.get("/sessions/:sessionId", (req, res) => {
        const sessionId = req.params.sessionId;
        logger.info(`Session By Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (sessionId === undefined) {
                logger.warn(`sessionId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId"});
            } else {
                api.findSessionById(req.token, sessionId)
                    .then(sessionResult => {
                        if (sessionResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("Session by Id done");
                            res.json(sessionResult);
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.post("/sessions", (req, res) => {
        logger.info(`create sessions`);
        const { webSiteId, baseURL, name, overlayType } = req.body;
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token: Token = req.token;
            if (baseURL === undefined || name === undefined || overlayType === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"invalid parameter"});
            } else {
                api.createSession(token, webSiteId, baseURL, name, overlayType)
                    .then(creationResult => {
                        if (creationResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:creationResult});
                        } else {
                            logger.info("session is created and added");
                            res.json({sessionId:creationResult.id});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });


    app.post("/sessions/:sessionId/explorations", (req, res) => {
        const sessionId = req.params.sessionId;
        const { testerName, interactionList, startDate, stopDate } = req.body;
        logger.info(`Session By Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token : Token = req.token;
            if (sessionId === undefined || interactionList === undefined ) {
                logger.warn(`sessionId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId or No interactionList"});
            } else {
                api.addExploration(token, sessionId, testerName, interactionList, startDate, stopDate)
                    .then(explorationResult => {
                        if (explorationResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("Exploration is added");
                            res.json({explorationNumber:explorationResult});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });


    app.post("/models", (req, res) => {
        logger.info(`create model`);
        const { depth, interpolationfactor, predictionType } = req.body;
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token: Token = req.token;
            if (depth === undefined || interpolationfactor === undefined || predictionType === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"invalid parameter"});
            } else {
                api.createModel(token, depth, interpolationfactor, predictionType)
                    .then(creationResult => {
                        if (creationResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:creationResult});
                        } else {
                            logger.info("session is created and added");
                            res.json({modelId:creationResult.id});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.get("/models/:modelId", (req, res) => {
        const modelId = req.params.modelId;
        logger.info(`model by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (modelId === undefined) {
                logger.warn(`modelId is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId"});
            } else {
                api.findModelById(req.token, modelId)
                    .then(modelResult => {
                        if (modelResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("Model by Id done");
                            res.json(modelResult);
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.post("/models/:modelId/link/:sessionId", (req, res) => {
        const modelId = req.params.modelId;
        const sessionId = req.params.sessionId;
        logger.info(`link model to session`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (modelId === undefined || sessionId === undefined) {
                logger.warn(`modelId or sessionId is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId or sessionId"});
            } else {
                api.linkModelToSession(req.token, modelId, sessionId)
                    .then(linkResult => {
                        if (linkResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else if (linkResult === "ModelIsUnknown") {
                            logger.info("Model not found");
                            res.status(NOT_FOUND_STATUS).json({message:"ModelNotFound"});
                        } else {
                            logger.info("Model by Id done");
                            res.json({message:linkResult});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

}
