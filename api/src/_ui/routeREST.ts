import { Application } from 'express';
import { logger } from "../logger";
import Token from "../domain/Token";
import APIApplication from '../application/APIApplication';
import { Kind } from '../domain/Kind';
import Evaluation from '../domain/Evaluation';
import Action from '../domain/Action';

const INVALID_PARAMETERS_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Application, api: APIApplication) {

    app.get("/ping", (req, res) => {
        logger.info(`ping`);
        res.json({message:'alive'});
    });

    app.get('/plugin-info', (req, res) => {
        logger.info('GET plugin info');
        const info = api.getPluginInfo();
        if (!info) {
            logger.debug(`no pluginInfo`);
            return res.send({})
        } else {
            logger.debug(`pluginInfo : ${info}`);
            return res.send(info);
        }
    })

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
                        res.json(accountResult);
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
    });

    app.post("/invitations", (req, res) => {
        logger.info(`Add invitation`);
        const { toUsername, kind, key } = req.body;
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (toUsername === undefined || kind === undefined || key === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No toUsername, kind or key"});
            } else {
                api.addInvitation(toUsername, kind, key, req.token)
                    .then(result => {
                        if (result === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else if (result === "IncorrectUsername") {
                            res.status(INVALID_PARAMETERS_STATUS).json({message:"Incorrect username"});
                        } else {
                            logger.info("invitation created");
                            res.json({message:result});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.delete("/invitations", (req, res) => {
        logger.info(`Delete invitations`);
        const { toUsername, kind, key } = req.body;
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (toUsername === undefined || kind === undefined || key === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No toUsername, kind or key"});
            } else {
                api.removeInvitation(toUsername, kind, key, req.token)
                    .then(result => {
                        if (result === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else if (result === "IncorrectUsername") {
                            res.status(INVALID_PARAMETERS_STATUS).json({message:"Incorrect username"});
                        } else {
                            logger.info("invitation removed");
                            res.json({message:result});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.get("/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        logger.info(`webSites by Id`);
        
        api.findWebSiteById(webSiteId, req.token)
            .then(webSiteResult => {
                if (webSiteResult === "Unauthorized") {
                    res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                } else if (webSiteResult === undefined) {
                    res.status(NOT_FOUND_STATUS).json({message:"Not found"});
                } else {
                    logger.info("webSites by Id done");
                    res.json(webSiteResult);
                }
            })
            .catch((e) => {
                logger.error(`error:${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
            });
        
    });

    app.patch("/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        const { name, mappingList } = req.body;
        logger.info(`Patch webSites by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No webSiteId"});
            } else {
                api.updateWebSite(webSiteId, name, mappingList, req.token)
                    .then(webSiteResult => {
                        if (webSiteResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("webSites by Id done");
                            res.json({message:webSiteResult});
                        }
                    })
                    .catch((e) => {
                        logger.error(`error:${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                    });
            }
        }
    });

    app.delete("/websites/:webSiteId", (req, res) => {
        const webSiteId = req.params.webSiteId;
        logger.info(`delete webSite by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (webSiteId === undefined) {
                logger.warn(`webSiteId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No webSiteId"});
            } else {
                api.removeWebSite(webSiteId, req.token)
                    .then(webSiteResult => {
                        if (webSiteResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("webSite is removed");
                            res.json({message:webSiteResult});
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
        const { name, mappingList } = req.body;
        logger.debug(`${mappingList}`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token: Token = req.token;
            if (name === undefined || mappingList === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"invalid parameter"});
            } else {
                api.createWebSite(name, mappingList, req.token)
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
        if (sessionId === undefined) {
            logger.warn(`sessionId`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId"});
        } else {
            api.findSessionById(sessionId, req.token)
                .then(sessionResult => {
                    if (sessionResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else if (sessionResult === undefined) {
                        res.status(NOT_FOUND_STATUS).json({message:"Not found"});
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
    });

    app.delete("/sessions/:sessionId", (req, res) => {
        const sessionId = req.params.sessionId;
        logger.info(`delete session by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (sessionId === undefined) {
                logger.warn(`sessionId`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId"});
            } else {
                api.removeSession(sessionId, req.token)
                    .then(sessionResult => {
                        if (sessionResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("Session is removed");
                            res.json({message:sessionResult});
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
        const { webSiteId, baseURL, name, description, overlayType } = req.body;
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            const token: Token = req.token;
            if (baseURL === undefined || name === undefined || overlayType === undefined || webSiteId === undefined || description === undefined) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"invalid parameter"});
            } else {
                api.createSession(webSiteId, baseURL, name, description, overlayType, token)
                    .then(creationResult => {
                        if (creationResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:creationResult});
                        } else {
                            logger.info("session is created and added:", creationResult.id);
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
        logger.info(`Add a new exploration to the session`);
        if (sessionId === undefined || interactionList === undefined ) {
            logger.warn(`sessionId`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId or No interactionList"});
        } else {
            api.addExploration(sessionId, testerName, interactionList, startDate, stopDate, req.token)
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
    });

    app.post("/sessions/:sessionId/explorations/:expNum/interactions", (req, res) => {
        const { sessionId, expNum } = req.params;
        const { interactionList } = req.body;
        logger.info(`Push new actions in the exploration`);

        if (sessionId === undefined || expNum === undefined || interactionList === undefined ) {
            logger.warn(`invalid parameters`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId or No expNum or No interactionList"});
        } else {
            console.log(expNum, parseInt(expNum))
            if (parseInt(expNum) === undefined) {
                logger.warn(`invalid expNum type`);
                return res.status(INVALID_PARAMETERS_STATUS).json({message:"expNum must be an integer"});
            }
            if (!Array.isArray(interactionList)) {
                logger.warn(`interactionList must be an array`);
                return res.status(INVALID_PARAMETERS_STATUS).json({message:"interactionList is malformed"});
            }
            const isWellFormed = interactionList.every((interaction:any) => interaction.hasOwnProperty("kind") && interaction.hasOwnProperty("value"))
            if (!isWellFormed) {
                logger.warn(`interactionList invalid properties`);
                return res.status(INVALID_PARAMETERS_STATUS).json({message:"interactionList is malformed"});
            }
            api.addInteractions(sessionId, parseInt(expNum), interactionList, req.token)
                .then(explorationResult => {
                    if (explorationResult === "Unauthorized") {
                        return res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("Interactions added to exploration " + expNum);
                        return res.json({expNum, sessionId});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    return res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
    })



    app.post("/sessions/:sessionId/screenshots", (req, res) => {
        const sessionId = req.params.sessionId;
        const { screenshotList } = req.body;
        logger.info(`Create screenshots`);
        logger.debug(`screenshotList:${JSON.stringify(screenshotList)}`);
        if (sessionId === undefined || screenshotList === undefined) {
            logger.warn(`sessionId or screenshotList undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId or No screenshotList"});
        } else {
            api.addScreenshots(sessionId, screenshotList, req.token)
                .then(screenshotResult => {
                    if (screenshotResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else if (screenshotResult === "InvalidScreenshots") {
                        res.status(INVALID_PARAMETERS_STATUS).json({message:"InvalidScreenshots"});
                    } else {
                        logger.info("Screenshots are added");
                        res.json({message:"ScreenshotsAdded"});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
        
    });

    app.get("/sessions/:sessionId/screenshots", (req, res) => {
        const sessionId = req.params.sessionId;
        logger.info(`Get screenshots`);
        if (sessionId === undefined) {
            logger.warn(`sessionId undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No sessionId"});
        } else {
            api.findScreenshotsBySessionId(sessionId, req.token)
                .then(screenshotResult => {
                    if (screenshotResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("Screenshots are returned");
                        res.json({screenshotList:screenshotResult});
                    }
                })  
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
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
                api.createModel(depth, interpolationfactor, predictionType, token)
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
        if (modelId === undefined) {
            logger.warn(`modelId is undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId"});
        } else {
            api.findModelById(modelId, req.token)
                .then(modelResult => {
                    if (modelResult === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else if(modelResult === undefined) {
                        res.status(NOT_FOUND_STATUS).json({message:"Model not found"});
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
        
    });

    app.delete("/models/:modelId", (req, res) => {
        const modelId = req.params.modelId;
        logger.info(`delete model by Id`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (modelId === undefined) {
                logger.warn(`modelId is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId"});
            } else {
                api.removeModel(modelId, req.token)
                    .then(modelResult => {
                        if (modelResult === "Unauthorized") {
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else {
                            logger.info("Model by Id done");
                            res.json({message:modelResult});
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
        logger.info(`link model to session: ${JSON.stringify(modelId)}, ${JSON.stringify(sessionId)}`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (modelId === undefined || sessionId === undefined) {
                logger.warn(`modelId or sessionId is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId or sessionId"});
            } else {
                api.linkModelToSession(modelId, sessionId, req.token)
                    .then(linkResult => {
                        if (linkResult === "Unauthorized") {
                            logger.info("Link: Not Authorized");
                            res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                        } else if (linkResult === "ModelIsUnknown") {
                            logger.info("Link: Model not found");
                            res.status(NOT_FOUND_STATUS).json({message:"ModelNotFound"});
                        } else {
                            logger.info("Link is done");
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

    app.post("/models/:modelId/probabilities", (req, res) => {
        const modelId = req.params.modelId;
        const {interactionList} = req.body;
        logger.info(`get probabilities`);
        
        if (modelId === undefined || interactionList === undefined) {
            logger.warn(`modelId or interactionList are undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId or no InteractionList"});
        } else {
            api.computeProbabilities(modelId, interactionList, req.token)
                .then(probabilities => {
                    if (probabilities === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("Probabilities are computed");
                        res.json({probabilities:Array.from(probabilities)});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }

    });

    app.post("/models/:modelId/comment-distributions", (req, res) => {
        const modelId = req.params.modelId;
        const {interactionList} = req.body;
        logger.info(`get comment distributions`);
        if (modelId === undefined || interactionList === undefined) {
            logger.warn(`modelId or interactionList are undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId or no InteractionList"});
        } else {
            api.getCommentDistributions(modelId, interactionList, req.token)
                .then(commentDistributions => {
                    if (commentDistributions === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("Comment distributions are computed");
                        res.json({commentDistributions:Array.from(commentDistributions)});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }

    });

    app.get("/models/:modelId/ngrams", (req, res) => {
        const modelId = req.params.modelId;
        logger.info(`get all ngram`);
        
        if (modelId === undefined) {
            logger.warn(`modelId is undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No modelId"});
        } else {
            api.getAllNgram(modelId, req.token)
                .then(result => {
                    if (result === "Unauthorized") {
                        res.status(FORBIDDEN_STATUS).json({message:"Unauthorized"});
                    } else {
                        logger.info("All ngram are computed");
                        res.json({ngrams:result});
                    }
                })
                .catch((e) => {
                    logger.error(`error:${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
                });
        }
        
    });

    app.get("/public/authorizations", (req, res) => {
        const {key, kind} = req.query;
        logger.info(`is authorization public ?`);
        if (key === undefined || kind === undefined) {
            logger.warn(`key or kind is undefined`);
            res.status(INVALID_PARAMETERS_STATUS).json({message:"No key or kind"});
        } else {
            if (kind !== Kind.Model && kind !== Kind.Session && kind !== Kind.WebSite) {
                res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid Kind"});
            } else {
                if (typeof key !== "string") {
                    res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid key"});
                } else {
                    api.isAuthorizationPublic(kind, key)
                        .then(result => {
                            logger.debug('result : '+result);
                            res.json({isPublic:result});
                        })
                }
            }
        }
    });

    app.post("/public/authorizations", (req, res) => {
        const {key, kind} = req.body;
        logger.info(`add a new public authorization`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (key === undefined || kind === undefined) {
                logger.warn(`key or kind is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No key or kind"});
            } else {
                if (kind !== Kind.Model && kind !== Kind.Session && kind !== Kind.WebSite) {
                    logger.debug('not a valid kind: '+kind);
                    res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid Kind"});
                } else {
                    if (typeof key !== "string") {
                        logger.debug('not a valid key'+key);
                        res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid key"});
                    } else {
                        api.makeAuthorizationPublic(kind, key, req.token)
                            .then(result => {
                                logger.debug('result : '+result);
                                res.json({message:result});
                            })
                    }
                }
            }
        }
    });

    app.delete("/public/authorizations", (req, res) => {
        const {key, kind} = req.body;
        logger.info(`delete public authorization`);
        if (req.token === undefined) {
            logger.warn(`no token`);
            res.status(FORBIDDEN_STATUS).json({message:"No token"});
        } else {
            if (key === undefined || kind === undefined) {
                logger.warn(`key or kind is undefined`);
                res.status(INVALID_PARAMETERS_STATUS).json({message:"No key or kind"});
            } else {
                if (kind !== Kind.Model && kind !== Kind.Session && kind !== Kind.WebSite) {
                    res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid Kind"});
                } else {
                    if (typeof key !== "string") {
                        res.status(INVALID_PARAMETERS_STATUS).json({message:"Not a valid key"});
                    } else {
                        api.revokePublicAuthorization(kind, key, req.token)
                            .then(result => {
                                res.json({message:result});
                            })
                    }
                }
            }
        }
    });

    app.get("/evaluator/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`getEvaluator for sessionId ${sessionId}`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }
        return api.getEvaluator(sessionId, req.token)
            .then((evaluator) => {
                if (evaluator === "Unauthorized") {
                    return res.sendStatus(FORBIDDEN_STATUS)
                }
                if (evaluator === undefined) {
                    return res.sendStatus(NOT_FOUND_STATUS)
                }
                else {
                    return res.send({
                        id: evaluator.id,
                        description: evaluator.description,
                        expression: evaluator.expression,
                        sessionId: evaluator.sessionId
                    })
                }
            })
            .catch((e: Error) => {
                logger.error(`error:${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
            });
        });

    app.post("/evaluator/create", (req, res) => {
        const { sessionId, description, expression } = req.body;
        logger.info(`create evaluator (sessionId:${sessionId}, description: ${description}, expression: ${expression})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }
        if (typeof expression === undefined) {
            logger.warn(`expression is required`);
            return res.status(INVALID_PARAMETERS_STATUS).send("expression is required");
        }
        if (typeof description === undefined) {
            logger.warn(`description is required`);
            return res.status(INVALID_PARAMETERS_STATUS).send("description is required");
        }

        if (expression.length === 0) {
            logger.warn(`expression must not be empty`);
            return res.status(INVALID_PARAMETERS_STATUS).send("expression must not be empty");
        }
        api.createEvaluator(sessionId, description, expression).then(() => {
            logger.debug("evaluator is created")
            return res.json({message: "Evaluator created"});
        })
        .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    });

    app.post("/evaluator/update/:sessionId", (req, res) => {
        const { sessionId } = req.params
        const { description, expression } = req.body;
        logger.info(`update evaluator (sessionId:${sessionId}, description: ${description}, expression: ${expression})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }
        api.updateEvaluator(sessionId, description, expression).then(() => {
            logger.debug("evaluator is updated")
            return res.send({sessionId: sessionId});
        })
        .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    });


    app.post("/evaluator/evaluate", (req, res) => {
        const { sessionId, actionList } = req.body;
        logger.info(`evaluate sequence (sessionId : ${sessionId}, actionList : ${JSON.stringify(actionList)})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }
        if (!Array.isArray(actionList)) {
            logger.warn("actionList must be an array")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }

        api.evaluateSequenceByExpression(
            sessionId, 
            actionList.map((actionData, index) => new Action(index, actionData.prefix, actionData.suffix))
            ).then((evaluation: Evaluation) => {
                return res.json(evaluation);
        }) .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    });

    app.post("/evaluator/evaluate-expression", (req, res) => {
        const { expression, actionList } = req.body;
        logger.info(`evaluate sequence (expression : ${expression}, actionList : ${JSON.stringify(actionList)})`);
        if (expression === undefined) {
            logger.warn("expression is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("expression is required");
        }
        if (!Array.isArray(actionList)) {
            logger.warn("actionList must be an array")
            return res.status(INVALID_PARAMETERS_STATUS).send("actionList muse be an array");
        }

        api.evaluateSequenceByExpression (
            expression, 
            actionList.map((actionData, index) => new Action(index, actionData.prefix, actionData.suffix))
            ).then((evaluation: Evaluation) => {
            return res.json(evaluation);
        }) .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    });

    app.delete("/evaluator/remove/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`remove evaluator for (sessionId : ${sessionId})`);
        if (sessionId === undefined) {
            logger.warn("sessionId is required")
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId is required");
        }
        api.removeEvaluator(sessionId, req.token)
        .then(() => {
            return res.json({sessionId})
        }) .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    });

    app.post("/evaluator/expressionToDot", (req, res) => {
        const { expression } = req.body;
        logger.info(`expression to do : ${expression}`);
        if (!expression) {
            logger.warn("expression parameter is required", expression)
            return res.status(INTERNAL_SERVER_ERROR_STATUS).send("Invalid parameters");
        }

        api.expressionToDot(expression).then((dot: any) => {
            return res.json({
                expressionIsValid: true,
                dot
            })
        }) .catch((e: Error) => {
            logger.error(`error:${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).json({ error: e });
        });
    })

}
