const { getWebSites, createSession, removeSession, createModel, linkModelToSession, getScreenshotsBySessionId, getSessionById, getModelById, getVideosBySessionId, getAllNgrams, isAuthorizationPublic, makeConnexionCodePublic, revokePublicConnexionCode , getEvaluatorBySessionId, getCrossEntropyBySession, updateSession, removeExploration} = require('../service/apiService');
const { sessionToGravity } = require("../service/gravityService");

const logger = require('../logger');
const buildInvitation = require("../invitations").buildInvitation;

const DEFAULT_INTERPOLATION_FACTOR = 2;
const DEFAULT_DEPTH = 8;

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/session/create', (req, res) => {
        let webSiteName = req.query.webSiteName;
        logger.info(`get session start page for webSiteName (id = ${webSiteName})`);

        getWebSites(req.session.jwt)
            .then(webSiteList => {
                if (webSiteList.length > 0) {
                    res.render('session/create.ejs', {
                        account:req.session, 
                        defaultWebSiteName: webSiteName, 
                        webSiteList: JSON.stringify(webSiteList),
                        webSiteURLList: JSON.stringify(webSiteList.map(site => site.url))
                    });
                } else {
                    let message = 'Cannot start a new session without any WebSite. ';
                    res.render('error.ejs', { message, error: undefined, account: req.session });
                }
            })
            .catch(error => {
                logger.error(error);
                let message = 'Error when fetching WebSite from Security Token';
                res.render('error.ejs', { message, error: e, account: req.session });
            })
    });

    app.post('/dashboard/session/create', (req, res) => {
        let { webSiteId, name, baseURL, interpolationfactor, depth, description, overlayType, recordingMode } = req.body;
        
        logger.info(`POST create session for WebSite (id = ${webSiteId})`);
        let connectionCode;
        if (interpolationfactor === undefined) {
            interpolationfactor = DEFAULT_INTERPOLATION_FACTOR;
        }
        if (depth === undefined) {
            depth = DEFAULT_DEPTH;
        }

        let sessionId;
        let modelId;

        let createSessionPromise = createSession(req.session.jwt, webSiteId, name, baseURL, description, overlayType, recordingMode);
        let createModelPromise = createModel(req.session.jwt, depth, interpolationfactor, "CSP");
        return Promise.all([createSessionPromise, createModelPromise])
            .then(([createdSessionId, createdModelId]) => {
                sessionId = createdSessionId;
                modelId = createdModelId;
                logger.debug(`Session created (id = ${sessionId}), Model created (id = ${modelId})`);
                return linkModelToSession(req.session.jwt, modelId, sessionId)
            })
            .then(() => {
                connectionCode = `${sessionId}$${modelId}`;
                logger.debug('session and model are created, a the link between them has been setted');
                return makeConnexionCodePublic(req.session.jwt, sessionId, modelId, webSiteId)
                .catch(e => {
                    logger.error(e.message);
                    let message = 'Failed to make Session public';
                    res.json({message: message});
                });
            })
            .then(() => {
                res.redirect(`/dashboard/session/view/${connectionCode}`);
            })
            .catch(e => {
                logger.error('Error while creating session, model and setting a link between them: '+e);
                let message = 'Cannot create the session';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    })


    app.get('/dashboard/session/update/:connectionCode', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`get session update page for sessionId (id = ${sessionId})`);

        Promise.all([getSessionById(req.session.jwt,sessionId),getWebSites(req.session.jwt)])
            .then(([session, webSiteList]) => {
                if (webSiteList.length > 0) {
                    let sessionWebSite = webSiteList.find(webSite => webSite.id === session.webSite.id);

                    logger.debug(session);

                    res.render('session/update.ejs', {
                        session,
                        account:req.session, 
                        defaultWebSiteName: sessionWebSite.name, 
                        webSiteList: JSON.stringify(webSiteList),
                        webSiteURLList: JSON.stringify(webSiteList.map(site => site.url))
                    });
                } else {
                    let message = 'Cannot update a session without any WebSite. ';
                    res.render('error.ejs', { message, error: undefined, account: req.session });
                }
            })
            .catch(error => {
                logger.error(error);
                let message = 'Error when fetching WebSite from Security Token';
                res.render('error.ejs', { message, error: undefined, account: req.session });
            })
    });


    app.post('/dashboard/session/update', (req, res) => {
        let { sessionId, webSiteId, name, baseURL, interpolationfactor, depth, description, overlayType, recordingMode } = req.body;
        
        logger.info(`POST update session (id = ${sessionId})`);
        logger.debug(`recordingMode = ${recordingMode}`);
        let connectionCode;
        if (interpolationfactor === undefined) {
            interpolationfactor = DEFAULT_INTERPOLATION_FACTOR;
        }
        if (depth === undefined) {
            depth = DEFAULT_DEPTH;
        }

        return updateSession(req.session.jwt, sessionId, webSiteId, name, baseURL, description, overlayType, recordingMode)
            .then(() => {
                res.redirect(`/account/account`);
            })
            .catch(e => {
                logger.error('Error while updating the session'+e);
                let message = 'Cannot create the session';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    })


    app.get('/dashboard/session/view/:connectionCode', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');

        logger.info(`GET view session (sessionId = ${sessionId}), (modelId = ${modelId})`);

        Promise.all([
            getSessionById(req.session.jwt,sessionId), 
            getModelById(req.session.jwt, modelId), 
            getScreenshotsBySessionId(req.session.jwt,sessionId), 
            getVideosBySessionId(req.session.jwt,sessionId), 
            isAuthorizationPublic("Session",sessionId), 
            getEvaluatorBySessionId(req.session.jwt, sessionId), 
            getCrossEntropyBySession(req.session.jwt, sessionId)
        ])
            .then(([session, model, screenshot, video, isSessionPublic, evaluator, crossEntropy]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;
                res.render('session/view.ejs', {
                    
                    account: req.session,
                    serverURL: buildInvitation(model.id, session.id),
                    session,
                    model,
                    evaluator,
                    connectionCode,
                    screenshot,
                    video,
                    isSessionPublic,
                    crossEntropy
                });
            })
            .catch(e => {
                logger.error(e);
                let message = 'Cannot view the session';
                res.render('error.ejs', { message, error: e, account: req.session })
            });
    });

    app.get('/dashboard/session/:connectionCode/explorations/:explorationNumber/delete', (req, res) => {
        const { connectionCode, explorationNumber } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET delete exploration (explorationNumber = ${explorationNumber}) of session (sessionId = ${sessionId}), (modelId = ${modelId})`);
        removeExploration(req.session.jwt, sessionId, explorationNumber)
            .then(() => {
                res.redirect(`/dashboard/session/${connectionCode}/explorations`);
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', { message, account: req.session, error: e })
            });
    });


    app.get('/dashboard/session/:connectionCode/explorations/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET connect to session (id = ${sessionId})`);

        Promise.all([getSessionById(req.session.jwt,sessionId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId)])
            .then(([session, screenshot, video]) => {
                logger.debug(`video: ${JSON.stringify(screenshot)}`);
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;

                res.render('session/explorations.ejs',{
                    account:req.session, 
                    serverURL: buildInvitation(modelId, sessionId),
                    session,
                    connectionCode,
                    screenshot,
                    video
                });
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', { message, account: req.session, error: e })
            });
    });

    app.get('/dashboard/session/:sessionId/json/', (req, res) => {
        const {sessionId} = req.params;
        logger.info(`GET session in JSON (id = ${sessionId})`);
        getSessionById(req.session.jwt,sessionId)
            .then(session => {
                res.json(session);
            })
            .catch(e => {
                logger.error(e);
                res.status(500).json({ error: e });
            });
    });

    app.get('/dashboard/session/:sessionId/gravityJson/', (req, res) => {
        const {sessionId} = req.params;
        logger.info(`GET session in JSON (id = ${sessionId})`);
        getSessionById(req.session.jwt,sessionId)
            .then(session => {
                logger.info(`Convert session in Gravity format (id = ${sessionId})`);
                const gravityJson = sessionToGravity(session);
                return res.json(gravityJson);
            })
            .catch(e => {
                logger.error(e);
                res.status(500).json({ error: e });
            });
    });

    app.get('/dashboard/session/:connectionCode/ngrams/', (req, res) => {
        const { connectionCode } = req.params
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET all ngramq model (id = ${modelId})`);
        getAllNgrams(req.session.jwt, modelId)
            
        .then(ngrams => {
                logger.debug(`ngrams:${JSON.stringify(ngrams)}`);
                res.render('session/ngrams.ejs', { ngrams:ngrams.ngrams, modelId, account: req.session, connectionCode });
            })
            .catch(e => {
                logger.error(e);
                let message = 'Cannot fetch the ngram';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    });


    app.get('/dashboard/session/:connectionCode/observations/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        
        Promise.all([getSessionById(req.session.jwt,sessionId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId)])
            .then(([session, screenshot, video]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;
                const explorationsWithObservation = session.explorationList.filter((exploration) => exploration.interactionList.some(interaction => {
                    return interaction.concreteType === "Observation" || interaction.concreteType === "Comment"
                }));
                const observations = explorationsWithObservation.map((exploration) => {
                    return exploration.interactionList.filter((interaction) => {
                        interaction.concreteType === "Comment" || interaction.concreteType === "Observation"
                    }).map((observation) => {
                        observation.explorationNumber = exploration.explorationNumber;
                        observation.testerName = exploration.testerName;
                        return observation;
                    });
                }).reduce((acc, curr) => acc.concat(curr), []);
                logger.debug(`observations:${JSON.stringify(observations)}`);
                res.render('session/observations.ejs',{
                    account:req.session, 
                    serverURL: buildInvitation(modelId, sessionId),
                    observations,
                    session,
                    connectionCode,
                    screenshot,
                    video
                });
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', { message, account: req.session, error: e })
            });
    });

    app.get('/open/session/:connectionCode/exploration/:explorationNumber/observation/:observationIndex', (req, res) => {
        const { connectionCode, explorationNumber, observationIndex } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');

        logger.debug(`GET observation (id = ${sessionId}, explorationNumber = ${explorationNumber}, observationIndex = ${observationIndex})`);
        
        Promise.all([getSessionById(req.session.jwt,sessionId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId)])
            .then(([session, screenshots, videos]) => {
                if (session !== undefined && screenshots !== undefined && videos !== undefined) {
                    let exploration = session.explorationList[explorationNumber];
                    if (exploration !== undefined ) {
                        let observation = exploration.interactionList[observationIndex];
                        if (observation.concreteType === "Observation") {
                            let screenshot = screenshots.screenshotList.find(sc=> sc.explorationNumber == explorationNumber && sc.interactionIndex == observation.index);
                            let video = videos.videoList.find(vi=> vi == explorationNumber);
                            res.render('session/observation.ejs',{
                                account:req.session, 
                                serverURL: buildInvitation(modelId, sessionId),
                                observation,
                                explorationNumber,
                                session,
                                connectionCode,
                                screenshot,
                                video
                            });
                        } else {
                            res.render('error.ejs', { message:"no bug report found", account: req.session, error: new Error("no bug report found") });
                        }
                    } else {
                        res.render('error.ejs', { message:"no exploration found", account: req.session, error: new Error("no exploration found") });
                    }
                } else {
                    res.render('error.ejs', { message:"no session, screenshot and video found", account: req.session, error: new Error("no session, screenshot and video found") });
                }
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', { message, account: req.session, error: e })
            });
    });

    app.get("/dashboard/session/:connectionCode/print", (req, res) => {
        const { connectionCode } = req.params
        const [sessionId] = connectionCode.split('$');
        logger.info(`GET print session (id = ${sessionId})`);
        fetch('http://' + config.printer.host + ':' + config.printer.port + '/printer/print/puppeteer/', {
            method: 'POST',
            body: JSON.stringify({
                sessionId
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => {
                logger.debug(`receive response from printer with status ${response.status}`);
                if (response.status == 200) {
                    logger.debug('ok 200');
                    return response.json();
                }
                if (response.status == 404) {
                    return Promise.reject('cannot generate test script');
                }
                return Promise.reject('error in test script generation');
            })
            .then(data => {
                if (data) {
                    res.set({ "Content-Disposition": `attachment; filename="${sessionId}.js"` });
                    res.send(data.print)
                } else {
                    res.render('error.ejs', { message: e.message, account: req.session, error: 'no output' });
                }
            })
            .catch(e => {
                logger.error(e);
                res.render('error.ejs', { message: "cannot generate script for such a session", account: req.session, error: e });
            })
    });

    app.post("/dashboard/session/profile_coverage_view/:connectionCode", (req, res) => {
        const { connectionCode } = req.params;
        const { connectionCodeProfile } = req.body;

        logger.info(`POST view profile coverage`);

        res.redirect(`/dashboard/session/profile_coverage/${connectionCode}/${connectionCodeProfile}`);
    })

    app.get('/dashboard/session/remove/:connectionCode', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId] = connectionCode.split('$');
        logger.info(`remove session (${sessionId})`);
        removeSession(req.session.jwt, sessionId)
            .then(() => {
                res.redirect('/account/account');
            }).catch(e => {
                logger.error(e);
                let message = 'Failed to remove session';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    });

    app.post('/dashboard/public/connexionCode', (req, res) => {
        const { isPublic, sessionId, modelId, webSiteId } = req.body;
        logger.info(`Post public session (${sessionId}, ${modelId}, ${webSiteId}, ${isPublic})`);
        if (isPublic) {
            makeConnexionCodePublic(req.session.jwt, sessionId, modelId, webSiteId)
                .then(() => {
                    res.json({message: 'Session is now public'});
                })
                .catch(e => {
                    logger.error(e.message);
                    let message = 'Failed to make Session public';
                    res.json({message: message});
                });
        } else {
            revokePublicConnexionCode(req.session.jwt, sessionId, modelId, webSiteId)
                .then(() => {
                    res.json({message: 'Session is no more public'});
                })
                .catch(e => {
                    logger.error(e.message);
                    let message = 'Failed to revoke authorization public';
                    res.json({message: message});
                });
        }
    
    });



}
