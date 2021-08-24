const { getWebSites, createSession, removeSession, createModel, linkModelToSession, getScreenshotsBySessionId, getSessionById, getModelById, getVideosBySessionId, getAllNgrams, isAuthorizationPublic, makeConnexionCodePublic, revokePublicConnexionCode } = require('../apiService');
const logger = require('../logger');
const buildInvitation = require("../invitations").buildInvitation;

const DEFAULT_INTERPOLATION_FACTOR = 2;
const DEFAULT_DEPTH = 8;

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/session/start', (req, res) => {
        let webSiteName = req.query.webSiteName;
        logger.info(`get session start page for webSiteName (id = ${webSiteName})`);

        getWebSites(req.session.jwt)
            .then(webSiteList => {
                if (webSiteList.length > 0) {
                    res.render('session/start.ejs', {
                        account: req.session,
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

    app.post('/dashboard/session/start', (req, res) => {
        let { webSiteId, name, baseURL, interpolationfactor, depth, overlayType, useTestScenario } = req.body;

        useTestScenario = useTestScenario === "yes"

        logger.info(`Start session for WebSite (id = ${webSiteId})`);

        let connectionCode;
        if (interpolationfactor === undefined) {
            interpolationfactor = DEFAULT_INTERPOLATION_FACTOR;
        }
        if (depth === undefined) {
            depth = DEFAULT_DEPTH;
        }

        let sessionId;
        let modelId;

        let createSessionPromise = createSession(req.session.jwt, webSiteId, name, baseURL, overlayType)
        let createModelPromise = createModel(req.session.jwt, depth, interpolationfactor, "CSP")
        return Promise.all([createSessionPromise, createModelPromise])
            .then(([createdSessionId, createdModelId]) => {
                sessionId = createdSessionId;
                modelId = createdModelId;
                return linkModelToSession(req.session.jwt, modelId, sessionId)
            })
            .then(() => {
                connectionCode = `${sessionId}$${modelId}`;
                logger.debug('session and model are creating, a the link between them has been setted');
                res.redirect(`/dashboard/session/view/${connectionCode}`);
            })
            .catch(e => {
                logger.error('Error while creating session, model and settig a link between them: '+e);
                let message = 'Cannot create the session';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    })

    app.get('/dashboard/session/view/:connectionCode', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');

        logger.info(`GET view session (sessionId = ${sessionId}), (modelId = ${modelId})`);

        Promise.all([getSessionById(req.session.jwt,sessionId), getModelById(req.session.jwt,modelId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId), isAuthorizationPublic("Session",sessionId)])
            .then(([session, model, screenshot, video, isSessionPublic]) => {
                logger.debug(`screenshot:${JSON.stringify(screenshot)}`);
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;
                if (session.useTestScenario === undefined) {
                    session.useTestScenario = false;
                }
                res.render('session/view.ejs', {
                    account: req.session,
                    serverURL: buildInvitation(model.id, session.id),
                    session,
                    model,
                    connectionCode,
                    screenshot,
                    video,
                    isSessionPublic
                });
            })
            .catch(e => {
                logger.error(e);
                let message = 'Cannot view the session';
                res.render('error.ejs', { message, error: e, account: req.session })
            });
    });


    app.get('/dashboard/session/:connectionCode/explorations/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET connect to session (id = ${sessionId})`);

        Promise.all([getSessionById(req.session.jwt,sessionId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId)])
            .then(([session, screenshot, video]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;
                if (session.useTestScenario === undefined) {
                    session.useTestScenario = false;
                }
                res.render('session/explorations.ejs', {
                    account: req.session,
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

    app.get('/dashboard/session/:connectionCode/json/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
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


    app.get('/dashboard/session/:connectionCode/comments/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        
        Promise.all([getSessionById(req.session.jwt,sessionId), getScreenshotsBySessionId(req.session.jwt,sessionId), getVideosBySessionId(req.session.jwt,sessionId)])
            .then(([session, screenshot, video]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))
                session.participants = participants;
                if (session.useTestScenario === undefined) {
                    session.useTestScenario = false;
                }
                res.render('session/comments.ejs', {
                    account: req.session,
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

    app.get("/dashboard/session/profile_coverage/:connectionCode/:connectionCodeProfile", (req, res) => {
        const { connectionCode, connectionCodeProfile } = req.params;

        logger.info(`GET view profile coverage`);

        const modelId = connectionCode.split('$')[1]
        const modelIdProfile = connectionCodeProfile.split('$')[1]

        const modelURL = `http://${config.model.host}:${config.model.port}/model/profile_coverage/${modelId}/${modelIdProfile}`
        fetch(modelURL).then(response => {
            if (response.ok) {
                return response.json()
            }
        })
            .then((data) => {
                if (data) {
                    res.render('session/coverage.ejs', {
                        account: req.session,
                        coverage: data.coverage,
                        connectionCode,
                        connectionCodeProfile
                    })
                } else {
                    res.render('error.ejs', { message, account: req.session, error: 'no coverage' });
                }

            })
            .catch(e => {
                logger.error(e);
                let message = 'Failed to compute coverage';
                res.render('error.ejs', { message, account: req.session, error: e });
            })
    });

    app.get('/dashboard/session/remove/:connectionCode', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId] = connectionCode.split('$');
        logger.info(`remove session (${connectionCode})`);
        removeSession(req.session.jwt, sessionId)
            .then(() => {
                res.redirect('/account/account');
            }).catch(e => {
                logger.error(e);
                let message = 'Failed to remove connectionCode';
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
