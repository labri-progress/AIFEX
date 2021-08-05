const fetch = require('node-fetch');
const config = require('./config');

module.exports.getAccount = function (token) {
    const VERIFY_URL = `http://${config.api.host}:${config.api.port}/account`;
    return fetch(VERIFY_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return undefined;
            }
        })
}

module.exports.createWebSite = function (token, name, url, mappingList) {
    const apiCreateWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites';
    let bodyCreateWebSite = {
        name,
        url,
        mappingList,
    }
    let optionCreateWebSite = {
        method: 'POST',
        body: JSON.stringify(bodyCreateWebSite),
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
    }
    return fetch(apiCreateWebSiteURL, optionCreateWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
}

module.exports.updateWebSite = function (token, webSiteId, name, url, mappingList) {
    const apiUpdateWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites/' + webSiteId;
    let bodyUpdateWebSite = {
        name,
        url,
        mappingList,
    }
    let optionUpdateWebSite = {
        method: 'PATCH',
        body: JSON.stringify(bodyUpdateWebSite),
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
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


module.exports.getWebSites = function (token) {
    return module.exports.getAccount(token)
        .then(account => {
            const webSitesAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "WebSite");
            const webSiteFetchList = webSitesAuthorization.map(webSiteAuthorization => {
                const WEBSITE_URL = `http://${config.api.host}:${config.api.port}/websites/${webSiteAuthorization.key}`;
                return fetch(WEBSITE_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
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

module.exports.getSessions = function (token) {
    return module.exports.getAccount(token)
        .then(account => {
            const sessionsAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "Session");
            const sessionFetchList = sessionsAuthorization.map(sessionAuthorization => {
                const SESSION_URL = `http://${config.api.host}:${config.api.port}/sessions/${sessionAuthorization.key}`;
                return fetch(SESSION_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
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

module.exports.getModels = function (token) {
    return module.exports.getAccount(token)
        .then(account => { 
            const modelsAuthorization = account.authorizationSet.filter(authorization => authorization.kind === "Model");
            const modelFetchList = modelsAuthorization.map(modelAuthorization => {
                const MODEL_URL = `http://${config.api.host}:${config.api.port}/models/${modelAuthorization.key}`;
                return fetch(MODEL_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
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

module.exports.removeWebSite = function (token, webSiteId) {
    const apiRemoveWebSiteURL = 'http://' + config.api.host + ':' + config.api.port + '/websites/' + webSiteId;
    let optionRemoveWebSite = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveWebSiteURL, optionRemoveWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Cannot remove WebSite');
            }
        })
        .catch(e => {
            console.log(e);
        })
}

module.exports.removeSession = function (token, sessionId) {
    const apiRemoveSessionURL = 'http://' + config.api.host + ':' + config.api.port + '/sessions/' + sessionId;
        let optionRemoveSession = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveSessionURL, optionRemoveSession)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
        .catch(e => {
            console.log(e);
        })
}

module.exports.removeModel = function (token, modelId) {
    const apiRemoveModelURL = 'http://' + config.api.host + ':' + config.api.port + '/models/' + modelId;
    let optionRemoveModel = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json',"Authorization": `Bearer ${token}` },
    }
    return fetch(apiRemoveModelURL, optionRemoveModel)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
        .catch(e => {
            console.log(e);
        })
}