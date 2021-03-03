const fetch = require('node-fetch');
const jsonwebtoken = require("jsonwebtoken");
const config = require('./config');

const SECRET = "not really secret";

function token2Kind(token, kind) {
    if (token === null && token === undefined)  {
        return [];
    }
    let payload = jsonwebtoken.verify(token, SECRET);
    return payload.authorizationSet.filter( authorization => authorization._kind == kind).map(authorization => authorization._key);
}

module.exports.token2WebSite = function (token) {
    return token2Kind(token, "2");
}

module.exports.token2Model = function (token) {
    return token2Kind(token, "0");
}

module.exports.token2Session = function (token) {
    return token2Kind(token, "1");
}

module.exports.verify = function(token) {
    try {
        jsonwebtoken.verify(token, SECRET);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports.requestWebSiteFromToken = function(token) {
    // console.log('requestWebSiteFromToken(',token,')');
    const webSiteIdList = module.exports.token2WebSite(token);
    // console.log('get : ',JSON.stringify(webSiteIdList));
    const webSiteFetchList = webSiteIdList.map( webSiteId => {
        const WEBSITE_URL = `http://${config.website.host}:${config.website.port}/website/${webSiteId}`;
        // console.log('Fetch:',WEBSITE_URL);
        return fetch(WEBSITE_URL)
    })
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
}

module.exports.requestSessionFromToken = function(token) {
    let sessionIdList = module.exports.token2Session(token);
    sessionIdList = sessionIdList.map( sessionId => sessionId.split('$')[0])
    //console.log('get : ',JSON.stringify(sessionIdList));
    const sessionFetchList = sessionIdList.map( sessionId => {
        const SESSION_URL = `http://${config.session.host}:${config.session.port}/session/${sessionId}`;
        // console.log('Fetch:',SESSION_URL);
        return fetch(SESSION_URL)
    })
    return Promise.all(sessionFetchList)
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
}

module.exports.addWebSite = function(token, webSiteId) {
    const accountAddWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addwebsite';
    let bodyAddWebSite = {
        token,
        webSiteId,
    }
    let optionAddWebSite = {
        method: 'POST',
        body:    JSON.stringify(bodyAddWebSite),
        headers: { 'Content-Type': 'application/json' },
    }
    return fetch(accountAddWebSiteURL, optionAddWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
        .catch( e => {
            console.log(e);
        })
}

module.exports.addSession = function(token, sessionid) {
    const accountAddSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addsession';
    let bodyAddSession = {
        token,
        sessionid,
    }
    let optionAddSession = {
        method: 'POST',
        body:    JSON.stringify(bodyAddSession),
        headers: { 'Content-Type': 'application/json' },
    }
    return fetch(accountAddSessionURL, optionAddSession)
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


module.exports.removeWebSite = function(token, webSiteId) {
    const accountAddWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removewebsite';
    let bodyRemoveWebSite = {
        token,
        webSiteId,
    }
    let optionRemoveWebSite = {
        method: 'POST',
        body:    JSON.stringify(bodyRemoveWebSite),
        headers: { 'Content-Type': 'application/json' },
    }
    return fetch(accountAddWebSiteURL, optionRemoveWebSite)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
        .catch( e => {
            console.log(e);
        })
}

module.exports.removeSession = function(token, sessionid) {
    const accountRemoveSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removesession';
    // console.log('tokenUtil, removeSession:',accountRemoveSessionURL);
    let bodyRemoveSession = {
        token,
        sessionid,
    }
    let optionRemoveSession = {
        method: 'POST',
        body:    JSON.stringify(bodyRemoveSession),
        headers: { 'Content-Type': 'application/json' },
    }
    return fetch(accountRemoveSessionURL, optionRemoveSession)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('cannot add website to account');
            }
        })
        .catch( e => {
            console.log(e);
        })
}