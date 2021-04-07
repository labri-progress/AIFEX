const fetch = require('node-fetch');
const requestWebSiteFromToken = require('../tokenUtilities').requestWebSiteFromToken;
const addSession = require('../tokenUtilities').addSession;
const removeSession = require('../tokenUtilities').removeSession;
const logger = require('../logger');
const buildInvitation = require("../invitations").buildInvitation;

const DEFAULT_INTERPOLATION_FACTOR = 2;
const DEFAULT_DEPTH = 8;

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/session/start', (req, res) => {
        let webSiteName = req.query.webSiteName;
        logger.info(`GET start session page for webSiteName (id = ${webSiteName})`);
        
        requestWebSiteFromToken(req.session.jwt)
            .then(webSiteList => {
                if (webSiteList.length > 0) {
                    res.render('session/start.ejs', {
                        account:req.session, 
                        defaultWebSiteName: webSiteName, 
                        webSiteList: JSON.stringify(webSiteList),
                        webSiteURLList: JSON.stringify(webSiteList.map(site => site.url))
                    });
                } else {
                    let message = 'Cannot start a new session without any WebSite. ';
                    res.render('error.ejs', {message,error:undefined, account:req.session});    
                }
            })
            .catch(error => {
                logger.error(error);
                let message = 'Error when fetching WebSite from Security Token';
                res.render('error.ejs', {message,error:e, account:req.session});
            })
    });

    app.post('/dashboard/session/start', (req, res) => {
        let { webSiteId, name, baseURL, interpolationfactor, depth, overlayType, useTestScenario } = req.body;
                
        useTestScenario = useTestScenario === "yes"
        
        logger.info(`POST start session for WebSite (id = ${webSiteId})`);
        
        let connectionCode;
        if (interpolationfactor === undefined) {
            interpolationfactor = DEFAULT_INTERPOLATION_FACTOR;
        }
        if (depth === undefined) {
            depth = DEFAULT_DEPTH;
        }

        let sessionId;
        let modelId;

        const sessionCreateURL = 'http://' + config.session.host + ':' + config.session.port + '/session/create';
        let bodySessionCreate = {
            webSiteId,
            name,
            overlayType,
            useTestScenario,
            baseURL,
        }
        let optionSessionCreate = {
            method: 'POST',
            body:    JSON.stringify(bodySessionCreate),
            headers: { 'Content-Type': 'application/json' },
        }

        const modelCreateURL = 'http://' + config.model.host + ':' + config.model.port + '/model/create';
        let bodyModelCreate = {
            depth,
            interpolationfactor
        }
        let optionModelCreate = {
            method: 'POST',
            body:    JSON.stringify(bodyModelCreate),
            headers: { 'Content-Type': 'application/json' },
        }

        let createSessionPromise = fetch(sessionCreateURL, optionSessionCreate);
        let createModelPromise = fetch(modelCreateURL, optionModelCreate);
        return Promise.all([createSessionPromise, createModelPromise])
            .then( responseList => {
                let sessionResponse = responseList[0];
                let modelResponse = responseList[1];
                if (!sessionResponse.ok) {
                    throw new Error('session cannot be created', sessionResponse);
                }
                if (!modelResponse.ok) {
                    throw new Error('model cannot be created', modelResponse);
                }
                return Promise.all([sessionResponse.json(), modelResponse.json()])
            })
            .then((idList) => {
                sessionId = idList[0];
                modelId = idList[1];
                let linkModel2SessionURL = 'http://' + config.model.host + ':' + config.model.port + '/model/';
                linkModel2SessionURL = linkModel2SessionURL + modelId +'/link/' + sessionId;
                let optionLinkModel = {
                    method: 'POST',
                    body:    JSON.stringify({}),
                    headers: { 'Content-Type': 'application/json' },
                }
                return fetch(linkModel2SessionURL, optionLinkModel);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('model cannot be linked to session', response);
                }
                connectionCode = `${sessionId}$${modelId}`;
                return addSession(req.session.jwt, connectionCode)
            })
            .then( token => {
                req.session.jwt = token.jwt;
                res.redirect(`/dashboard/session/view/${connectionCode}`);
            })
            .catch( e => {
                logger.error(e);
                let message = 'Cannot create the session';
                res.render('error.ejs', {message, account: req.session, error:e});
            })
    })

    app.get('/dashboard/session/view/:connectionCode', (req, res) => {
        const {connectionCode} = req.params;
        const [sessionId, modelId] = connectionCode.split('$');

        logger.info(`GET view session (sessionId = ${sessionId}), (modelId = ${modelId})`);
        const sessionURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId;
        const modelURL = 'http://' + config.model.host + ':' + config.model.port + '/model/'+modelId;
        const screenshotURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/screenshotlist';
        const videoURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/videolist';
        
        const sessionPromise = fetch(sessionURL, {});
        const modelPromise = fetch(modelURL, {});
        const screenshotPromise = fetch(screenshotURL);
        const videoPromise = fetch(videoURL);

        Promise.all([sessionPromise, modelPromise,screenshotPromise, videoPromise])
            .then(([responseSession, responseModel, responseScreenshot, responseVideo]) => {
                if (responseSession.ok && responseModel.ok && responseScreenshot.ok && responseVideo.ok) {
                    return Promise.all([responseSession.json(), responseModel.json(), responseScreenshot.json(), responseVideo.json()]);
                } else {
                    let msg = `session:${responseSession.statusText}, model:${responseModel.statusText}`
                    throw new Error(msg);
                }
            })
            .then(([session, model,screenshot, video]) => {
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
                    video
                    });
            })
            .catch(e => {
                logger.error(e);
                let message = 'Cannot view the session';
                res.render('error.ejs', {message, error:e, account: req.session})
            });
    });


    app.get('/dashboard/session/:connectionCode/explorations/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET connect to session (id = ${sessionId})`);
        const sessionURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId;
        const screenshotURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/screenshotlist';
        const videoURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/videolist';
        // console.log(screenshotURL);
        const sessionPromise = fetch(sessionURL);
        const screenshotPromise = fetch(screenshotURL);
        const videoPromise = fetch(videoURL);
        Promise.all([sessionPromise,screenshotPromise, videoPromise])
            .then(([responseSession, responseScreenshot, responseVideo]) => {
                if (responseSession.ok && responseScreenshot.ok && responseVideo.ok) {
                    return Promise.all([responseSession.json(), responseScreenshot.json(), responseVideo.json()]);
                } else {
                    let msg = `session:${responseSession.statusText}`;
                    throw new Error(msg);
                }
            })
            .then(([session, screenshot, video]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))                
                session.participants = participants;
                if (session.useTestScenario === undefined) {
                    session.useTestScenario = false;
                }
                res.render('session/explorations.ejs',{
                    account:req.session, 
                    serverURL: buildInvitation(modelId, sessionId),
                    session, 
                    connectionCode,
                    screenshot, 
                    video});
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', {message, account:req.session, error:e})
            });
    });

    app.get('/dashboard/session/:connectionCode/json/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET session in JSON (id = ${sessionId})`);
        const sessionURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId;
        fetch(sessionURL, {})
        .then(responseSession => {
            if (responseSession.ok) {
                return responseSession.json();
            } else {
                let msg = `session:${responseSession.statusText}`;
                logger.error(msg);
                throw new Error(msg);
            }
        })
        .then(session => {
            res.json(session);
        })
        .catch(e => {
            logger.error(e);
            res.status(500).json({error:e});
        });
    });


    app.get('/dashboard/session/:connectionCode/ngrams/', (req, res) => {
        const { connectionCode } = req.params
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET session ngram model (id = ${modelId})`);
        const modelURL = 'http://' + config.model.host + ':' + config.model.port + '/model/'+ modelId+'/analyze/allngram';

        fetch(modelURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(ngrams => {
            res.render('session/ngrams.ejs', {ngrams, modelId, account:req.session,connectionCode});
        })
        .catch(e => {
            logger.error(e);
            let message = 'Cannot fetch the ngram';
            res.render('error.ejs', {message, account:req.session, error:e});
        })
    });


    app.get('/dashboard/session/:connectionCode/comments/', (req, res) => {
        const { connectionCode } = req.params;
        const [sessionId, modelId] = connectionCode.split('$');
        logger.info(`GET connect to session (id = ${sessionId})`);
        const sessionURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId;
        const screenshotURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/screenshotlist';
        const videoURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId + '/videolist';
        // console.log(screenshotURL);
        const sessionPromise = fetch(sessionURL);
        const screenshotPromise = fetch(screenshotURL);
        const videoPromise = fetch(videoURL);
        Promise.all([sessionPromise,screenshotPromise, videoPromise])
            .then(([responseSession, responseScreenshot, responseVideo]) => {
                if (responseSession.ok && responseScreenshot.ok && responseVideo.ok) {
                    return Promise.all([responseSession.json(), responseScreenshot.json(), responseVideo.json()]);
                } else {
                    let msg = `session:${responseSession.statusText}`;
                    throw new Error(msg);
                }
            })
            .then(([session, screenshot, video]) => {
                const participants = Array.from(session.explorationList.reduce((acc, curr) => acc.add(curr.testerName), new Set()))                
                session.participants = participants;
                if (session.useTestScenario === undefined) {
                    session.useTestScenario = false;
                }
                res.render('session/comments.ejs',{
                    account:req.session, 
                    serverURL: buildInvitation(modelId, sessionId),
                    session, 
                    connectionCode,
                    screenshot, 
                    video});
            })
            .catch(e => {
                let message = 'Cannot fetch the explorations';
                logger.error(message);
                res.render('error.ejs', {message, account:req.session, error:e})
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
                res.set({"Content-Disposition":`attachment; filename="${sessionId}.js"`});
                res.send(data.print)
            } else {
                res.render('error.ejs', {message: e.message, account:req.session, error:'no output'});
            }
        })
        .catch(e => {
            logger.error(e);
            res.render('error.ejs', {message: "cannot generate script for such a session", account:req.session, error:e});
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
                    account:req.session,
                    coverage: data.coverage, 
                    connectionCode, 
                    connectionCodeProfile
                })
            } else {
                res.render('error.ejs', {message, account:req.session, error:'no coverage'});
            }
            
        })
        .catch(e => {
            logger.error(e);
            let message = 'Failed to compute coverage';
            res.render('error.ejs', {message, account:req.session, error:e});
        })
    });

    app.get('/dashboard/session/remove/:connectionCode', (req, res) => {
        const {connectionCode} = req.params;
        logger.info(`remove session (${connectionCode})`);
        console.log("removing", connectionCode)
        removeSession(req.session.jwt , connectionCode)
            .then(token => {
                req.session.jwt = token.jwt;
                res.redirect('/account/account');
            }).catch(e => {
                logger.error(e);
                let message = 'Failed to remove connectionCode';
                res.render('error.ejs', {message, account:req.session, error:e});
            })
    });

    
}
