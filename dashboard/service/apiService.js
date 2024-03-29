const fetch = require('node-fetch');
const config = require('../config');
const logger = require('../logger');

module.exports.signup = function (username, email, password) {
    const SIGNUP_URL = `http://${config.api.host}:${config.api.port}/signup`;
    let bodySignup = {
        username,
        email,
        password
    }
    let optionSignup = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodySignup)
    }
    return fetch(SIGNUP_URL, optionSignup)
        .then(response => {
            if (response.ok) {
                return "AccountCreated"
            } else {
                return "UserNameAlreadyTaken"
            }
        })
}

module.exports.signin = function (username, password) {
    const SIGNIN_URL = `http://${config.api.host}:${config.api.port}/signin`;
    let bodySignin = {
        username,
        password
    }
    let optionSignin = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodySignin)
    }
    return fetch(SIGNIN_URL, optionSignin)
        .then(response => {
            if (response.ok) {
                return response.json().then(json => json.bearerToken)
            } else {
                logger.debug("IncorrectUsernameOrPassword")
                return "IncorrectUsernameOrPassword"
            }
        })
}

module.exports.getAccount = function (token) {
    const VERIFY_URL = `http://${config.api.host}:${config.api.port}/account`;
    return fetch(VERIFY_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return undefined;
            }
        })
}

module.exports.getWebSiteById = function (token, webSiteId) {
    const webSiteByIDURL = `http://${config.api.host}:${config.api.port}/websites/${webSiteId}`;
    return fetch(webSiteByIDURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {

                throw new Error("Failed to get Website for id " + webSiteId);
            }
        })
}

module.exports.getEvaluatorBySessionId = function (token, sessionId) {
    let getEvaluatorURL = 'http://' + config.api.host + ':' + config.api.port + '/evaluator/' + sessionId;
    return fetch(getEvaluatorURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return undefined;
            }
        })
}

module.exports.createEvaluator = function(token, sessionId, expression, description) {
    logger.info(`POST create evaluator for session (id = ${sessionId})`);
    const URL = 'http://' + config.api.host + ':' + config.api.port + '/evaluator/'
    return fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            sessionId,
            description,
            expression,
        }),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to create evaluator " + response.statusText)
        }
    })
}

module.exports.deleteEvaluator = function(token, sessionId) {
    const deleteEvaluatorURL = 'http://' + config.api.host + ':' + config.api.port + '/evaluator/' + sessionId;
    return fetch(deleteEvaluatorURL, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }).then(response => {
        return response.json()
    })
    .catch(error => {
        logger.error(error);
        throw new Error("Failed to delete evaluator")
    })
}

module.exports.updateEvaluator = function(token, sessionId, description, expression) {
    const updateEvaluatorURL = 'http://' + config.api.host + ':' + config.api.port + '/evaluator/' + sessionId;
    return fetch(updateEvaluatorURL, {
        method: "PATCH",
        body: JSON.stringify({
            sessionId,
            description,
            expression        
        }),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }).then(response => {
        return response.json()
    })
    .catch(error => {
        logger.error(error);
        throw new Error("Failed to update evaluator")
    })
}

module.exports.getEvaluatorExpressionDot = function(expression) {
    const checkEvaluatorValidityURL = 'http://' + config.api.host + ':' + config.api.port + '/evaluator/expressionToDot';
    logger.debug(expression)
    return fetch(checkEvaluatorValidityURL, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            expression
        })
    }).then(response => {
        return response.json()
    })
    .catch(error => {
        logger.error(error);
        throw new Error("Failed to get DOT expression")
    })
}

module.exports.updateWebSite = function (token, webSiteId, name, mappingList) {
    const apiUpdateWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites/' + webSiteId;
    let bodyUpdateWebSite = {
        name,
        mappingList,
    }
    let optionUpdateWebSite = {
        method: 'PATCH',
        body: JSON.stringify(bodyUpdateWebSite),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiUpdateWebSiteURL, optionUpdateWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot update website to account');
            }
        })
}

module.exports.removeWebSite = function (token, webSiteId) {
    const apiRemoveWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites/' + webSiteId;
    let optionRemoveWebSite = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveWebSiteURL, optionRemoveWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot remove website from account');
            }
        })
}

module.exports.createWebSite = function (token, name, mappingList) {
    const apiCreateWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites';
    let bodyCreateWebSite = {
        name,
        mappingList,
    }
    let optionCreateWebSite = {
        method: 'POST',
        body: JSON.stringify(bodyCreateWebSite),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiCreateWebSiteURL, optionCreateWebSite)
        .then(response => {
            if (response.ok) {
                return response.json().then(json => json.webSiteId);
            } else {
                throw new Error('cannot add website to account');
            }
        })
}

module.exports.getWebSites = function (token) {
    return module.exports.getAccount(token)
        .then(account => {
            const webSitesAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "WebSite");
            const webSiteFetchList = webSitesAuthorization.map(webSiteAuthorization => {
                const WEBSITE_URL = `http://${config.api.host}:${config.api.port}/websites/${webSiteAuthorization.key}`;
                return fetch(WEBSITE_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                });
            });
            return Promise.all(webSiteFetchList)
                .then(responseList => {
                    return Promise.all(responseList.map(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('cannot get website')
                        }
                    }));
                })
                .catch(e => {
                    console.log(e);
                    return [];
                })
        });
}

module.exports.getSessionById = function (token, sessionId) {
    const SESSION_URL = `http://${config.api.host}:${config.api.port}/sessions/${sessionId}`;
    return fetch(SESSION_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return undefined;
            }
        })
}

module.exports.removeSession = function (token, sessionId) {
    const apiRemoveSessionURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions/' + sessionId;
    let optionRemoveSession = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveSessionURL, optionRemoveSession)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot remove session');
            }
        })
}

module.exports.createSession = function (token, webSiteId, name, baseURL, description, overlayType, recordingMode) {
    const apiCreateSessionURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions';
    let bodyCreateSession = {
        name,
        webSiteId,
        baseURL,
        description,
        overlayType,
        recordingMode
    };
    let optionCreateSession = {
        method: 'POST',
        body: JSON.stringify(bodyCreateSession),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    logger.info("calling route session create")
    return fetch(apiCreateSessionURL, optionCreateSession)
        .then(response => {
            if (response.ok) {
                return response.json().then(json => json.sessionId);
            } else {
                throw new Error('cannot create session');
            }
        })
}


module.exports.updateSession = function (token, sessionId, webSiteId, name, baseURL, description, overlayType, recordingMode) {
    const apiUpdateSessionURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions';
    let bodyUpdateSession = {
        sessionId,
        name,
        webSiteId,
        baseURL,
        description,
        overlayType,
        recordingMode
    };
    let optionUpdateSession = {
        method: 'PATCH',
        body: JSON.stringify(bodyUpdateSession),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    logger.info("calling route session update")
    return fetch(apiUpdateSessionURL, optionUpdateSession)
        .then(response => {
            if (response.ok) {
                return response.json().then(json => json.sessionId);
            } else {
                throw new Error('cannot create session');
            }
        })
}


module.exports.getSessions = function (token) {
    return module.exports.getAccount(token)
        .then(account => {
            const sessionsAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "Session");
            const sessionFetchList = sessionsAuthorization.map(sessionAuthorization => {
                const SESSION_URL = `http://${config.api.host}:${config.api.port}/sessions/${sessionAuthorization.key}`;
                return fetch(SESSION_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                });
            });
            return Promise.all(sessionFetchList)
                .then(responseList => {
                    return Promise.all(responseList.map(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('cannot get session')
                        }
                    }));
                })
                .catch(e => {
                    console.log(e);
                    return [];
                })
        });
}

module.exports.removeExploration = function (token, sessionId, explorationNumber) {
    const apiRemoveExplorationURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions/' + sessionId + '/explorations/' + explorationNumber;
    return fetch(apiRemoveExplorationURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('cannot remove exploration');
        }
    })
}

module.exports.getCrossEntropyBySession = function (token, sessionId) {
    const SESSION_URL = `http://${config.api.host}:${config.api.port}/models/cross_entropy/session/${sessionId}`;
    const body = {
        depth: 8,
        interpolationfactor: 1,
        predictionType: "CSP"
    }

    return fetch(SESSION_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Failed to compute Cross Entropy : ${e.statusText}`)
        }
    })
    .catch(e => {
        return [];
    })        
}

module.exports.addScreenshots = function (token, sessionId, screenshotList) {
    const apiAddScreenshotsURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions/' + sessionId + '/screenshots';
    let bodyAddScreenshots = {
        screenshotList,
    };
    let optionAddScreenshots = {
        method: 'POST',
        body: JSON.stringify(bodyAddScreenshots),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiAddScreenshotsURL, optionAddScreenshots)
        .then(response => {
            if (response.ok) {
                return "ScreenshotsAdded";
            } else {
                throw new Error('cannot add screenshots');
            }
        })
}

module.exports.getScreenshotsBySessionId = function (token, sessionId) {
    const apiGetScreenshotsURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions/' + sessionId + '/screenshots';
    return fetch(apiGetScreenshotsURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot get screenshots');
            }
        })
}

module.exports.getVideosBySessionId = function (token, sessionId) {
    const apiGetVideosURL = 'http://' + config.api.host + ':' + config.api.port + '/session/' + sessionId + '/explorations-with-video';
    return fetch(apiGetVideosURL, {
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) {
                return response.json()
                    .then((resultInJon) => {
                        return { videoList: resultInJon.explorationNumbers.map((number) => parseInt(number))}
                    });
            } else {
                throw new Error('cannot get videos');
            }
        });
}


module.exports.createModel = function (token, depth, interpolationfactor, predictionType) {
    const apiCreateModelURL = 'http://' + config.api.host + ':' + config.api.port + '/models';
    let bodyCreateModel = {
        depth,
        interpolationfactor,
        predictionType
    };
    let optionCreateModel = {
        method: 'POST',
        body: JSON.stringify(bodyCreateModel),
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiCreateModelURL, optionCreateModel)
        .then(response => {
            if (response.ok) {
                return response.json().then((resultInJson) => resultInJson.modelId);
            } else {
                throw new Error('cannot create model');
            }
        })
}

module.exports.getModelById = function (token, modelId) {
    const MODEL_URL = `http://${config.api.host}:${config.api.port}/models/${modelId}`;
    return fetch(MODEL_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return undefined;
            }
        })
}

module.exports.removeModel = function (token, modelId) {
    const apiRemoveModelURL = 'http://' + config.api.host + ':' + config.api.port + '/models/' + modelId;
    let optionRemoveModel = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveModelURL, optionRemoveModel)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot remove model');
            }
        })
}


module.exports.getModels = function (token) {
    return module.exports.getAccount(token)
        .then(account => {
            const modelsAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "Model");
            const modelFetchList = modelsAuthorization.map(modelAuthorization => {
                const MODEL_URL = `http://${config.api.host}:${config.api.port}/models/${modelAuthorization.key}`;
                return fetch(MODEL_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                });
            });
            return Promise.all(modelFetchList)
                .then(responseList => {
                    return Promise.all(responseList.map(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Cannot Get models')
                        }
                    }));
                })
                .catch(e => {
                    console.log(e);
                    return [];
                })
        });
}

module.exports.linkModelToSession = function (token, modelId, sessionId) {
    const apiLinkModelToSessionURL = 'http://' + config.api.host + ':' + config.api.port + '/models/' + modelId + '/link/' + sessionId;
    let optionLinkModelToSession = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    }
    return fetch(apiLinkModelToSessionURL, optionLinkModelToSession)
        .then(response => {
            if (response.ok) {
                return "ModelLinkedToSession";
            } else {
                throw new Error('cannot link model to session');
            }
        })
}

module.exports.getAllNgrams = function (token, modelId) {
    const apiGetAllNgramsURL = 'http://' + config.api.host + ':' + config.api.port + '/models/' + modelId + '/ngrams';
    return fetch(apiGetAllNgramsURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot get all ngrams');
            }
        })
}

module.exports.isAuthorizationPublic = function (kind, key) {
    let isPublicAuthorizationURL = 'http://' + config.api.host + ':' + config.api.port + '/public/authorizations?';
    isPublicAuthorizationURL += 'kind=' + kind + '&';
    isPublicAuthorizationURL += 'key=' + key;

    return fetch(isPublicAuthorizationURL)
        .then(response => {
            if (response.ok) {
                return response.json().then((resultInJson) => resultInJson.isPublic);
            } else {
                throw new Error('cannot get public authorizations');
            }
        })
}



module.exports.makeConnexionCodePublic = function(token, sessionId, modelId, webSiteId) {
    let makePublicAuthorizationURL = 'http://' + config.api.host + ':' + config.api.port + '/public/authorizations';
    let makeSessionPublic = fetch(makePublicAuthorizationURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "Session",
            key: sessionId,
        })
    });
    let makeModelPublic = fetch(makePublicAuthorizationURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "Model",
            key: modelId,
        })
    });
    let makeWebSitePublic = fetch(makePublicAuthorizationURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "WebSite",
            key: webSiteId,
        })
    });
    return Promise.all([makeSessionPublic, makeModelPublic, makeWebSitePublic])
        .then((responses) => {
            if (responses.every(response => response.ok)) {
                return responses[0].json();
            } else {
                throw new Error('cannot make authorization public');
            }
        })
}

module.exports.revokePublicConnexionCode = function (token, sessionId, modelId, webSiteId) {
    let makePublicAuthorizationURL = 'http://' + config.api.host + ':' + config.api.port + '/public/authorizations';
    let makeSessionPublic = fetch(makePublicAuthorizationURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "Session",
            key: sessionId,
        })
    });
    let makeModelPublic = fetch(makePublicAuthorizationURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "Model",
            key: modelId,
        })
    });
    let makeWebSitePublic = fetch(makePublicAuthorizationURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            kind: "WebSite",
            key: webSiteId,
        })
    });
    return Promise.all([makeSessionPublic, makeModelPublic, makeWebSitePublic])
        .then((responses) => {
            if (responses.every(response => response.ok)) {
                return responses[0].json();
            } else {
                throw new Error('cannot make authorization public');
            }
        })
}


module.exports.generateTests = function (token, sessionId) {
    let generateTestsURL = 'http://' + config.api.host + ':' + config.api.port + '/generator/session/' + sessionId + '/all-actions';
    let generateTests = fetch(generateTestsURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` }
    });
    return generateTests
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot generate tests');
            }
        });
}







