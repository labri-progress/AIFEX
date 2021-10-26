import fetch from "node-fetch";
import fs from "fs";
import path from "path";

import * as winston from "winston";
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.label({ label: '[Initialization]' }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `${info.label} - ${info.level} - ${info.message} (${info.timestamp})`)
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  //if (process.env.NODE_ENV === 'production') {
  //}


const API_URL = `http://localhost/api`;

pingThenLoadDefault();

function pingThenLoadDefault() {
    logger.info(`ping api`);
    const API_PING_URL = `${API_URL}/ping`;

    return fetch(API_PING_URL)
    .then((resPing) => {
        if (resPing.ok) {
            loadDefault();
        } else {
            setTimeout(pingThenLoadDefault, 4000);
        }
    })
    .catch( e => {
        setTimeout(pingThenLoadDefault, 4000);
    })
}

async function loadDefault() {
    logger.info(`loadDefault`);
    try {
        await createAnonymousAccount();
        const tokenJWT = await signinAsAnonymous();
        const token = tokenJWT.jwt;
        logger.info(`get token : ${JSON.stringify(token)}`)
        const webSiteList = await createDefaultWebSite();
        await addSiteListToAnonymous(token, webSiteList);
        const cdiscountWebSiteId = webSiteList.find(webSite => webSite.name === 'cdiscount')._id;
        logger.info(`cdiscountWebSiteID:${cdiscountWebSiteId}`);
        const connexionCode = await createSessionAndModel(cdiscountWebSiteId);
        logger.info('connexion code : ',connexionCode);
        const sessionId = connexionCode.split('$')[0];
        await addSessionToAnonymous(token, sessionId);
        logger.info('sessionAddedToAnonymous');
        const modelId = connexionCode.split('$')[1];
        await addModelToAnonymous(token, modelId);
        logger.info('modelAddedToAnonymous');
        await addAllExplorationToSession(sessionId);
        logger.info('allExplorationToSession');
    } catch (e) {
        logger.error(e);
    }    
}


async function createDefaultWebSite() {
    logger.info(`createDefaultWebSite`)
    const mappingDirectory = path.join(__dirname, "..","mapping");

    const siteList = JSON.parse(fs.readFileSync(path.join(mappingDirectory, "siteList.json"), "utf8"));
    for (const site of siteList) {
        site._id = await createSite(site);
        let mappingList = [];
        for (const mappingfile of site.mappingFiles) {
            const mapPath = path.join(mappingDirectory, mappingfile);
            const mapping = JSON.parse(fs.readFileSync(mapPath, "utf8"));
            mappingList = mappingList.concat(mapping);
        }
        await addMappingListToWebSite(site, mappingList);
    }
    logger.info("default website are loaded");
    return siteList;
}


function createSite(site) {
    const url = WEBSITE_BASE_URL + "/create";
    const body = {
        name: site.name,
        url: site.url,
        mappingList: [],
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('website cannot be created');
        }

    })
}

function addMappingListToWebSite(site, mappingList) {
    const url = WEBSITE_BASE_URL + "/update";
    const body = {
        name: site.name,
        id: site._id,
        url: site.url,
        mappingList
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
        .then(res => {
            if (res.ok) {
                res.json();
            } else {
                throw new Error('mapping cannot be added');
            }
        })
}



function createAnonymousAccount() {
    const url = ACCOUNT_BASE_URL + "/signup";
    const body = {
        username: "anonymous",
        password: "anonymous"
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Account cannot be created');
        }

    })
}

function signinAsAnonymous() {
    const url = ACCOUNT_BASE_URL + "/signin";
    const body = {
        username: "anonymous",
        password: "anonymous"
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('anonymous cannot signin');
        }
    })
}

function addSiteListToAnonymous(token, websiteList) {
    const webSiteListAddAll = websiteList.map(webSite => {
        logger.info(`adding website ${webSite.name} (id = ${webSite._id}) to anonymous`);
        const url = ACCOUNT_BASE_URL + "/addwebsite";
        const body = {
            username: "anonymous",
            webSiteId: webSite._id
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
    })

    return Promise.all(webSiteListAddAll)
    .then(resAll => {
        if (resAll.every((res:any) => res.ok)) {
            logger.info(`all websites are added to anonymous`);
            return true;
        } else {
            throw new Error('some website cannot be added to anonymous');
        }
    })
}

function createSessionAndModel(webSiteId) {
    const baseURL = "https://www.cdiscount.com";
    const depth = 8;
    const interpolationfactor = 2;

    let sessionId;
    let modelId;

    const sessionCreateURL = 'http://' + config.session.host + ':' + config.session.port + '/session/create';
    const bodySessionCreate = {
        webSiteId,
        baseURL,
    }
    const optionSessionCreate = {
        method: 'POST',
        body:    JSON.stringify(bodySessionCreate),
        headers: { 'Content-Type': 'application/json' },
    }

    const modelCreateURL = 'http://' + config.model.host + ':' + config.model.port + '/model/create';
    const bodyModelCreate = {
        depth,
        interpolationfactor
    }
    const optionModelCreate = {
        method: 'POST',
        body:    JSON.stringify(bodyModelCreate),
        headers: { 'Content-Type': 'application/json' },
    }

    const createSessionPromise = fetch(sessionCreateURL, optionSessionCreate);
    const createModelPromise = fetch(modelCreateURL, optionModelCreate);
    return Promise.all([createSessionPromise, createModelPromise])
    .then( responseList => {
        const sessionResponse = responseList[0];
        const modelResponse = responseList[1];
        if (!sessionResponse.ok) {
            throw new Error('session cannot be created');
        }
        if (!modelResponse.ok) {
            throw new Error('model cannot be created');
        }
        return Promise.all([sessionResponse.json(), modelResponse.json()])
    })
    .then( idList => {
        sessionId = idList[0];
        modelId = idList[1];
        let linkModel2SessionURL = 'http://' + config.model.host + ':' + config.model.port + '/model/';
        linkModel2SessionURL = linkModel2SessionURL + modelId +'/link/' + sessionId;
        const optionLinkModel = {
            method: 'POST',
            body:    JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(linkModel2SessionURL, optionLinkModel);
    })
    .then( response => {
        if (!response.ok) {
            throw new Error('model cannot be linked to session');
        }
        return `${sessionId}$${modelId}`;
    });
}

function addSessionToAnonymous(token, sessionId) {
    const url = ACCOUNT_BASE_URL + "/addsession";
    const body = {
        username: "anonymous",
        sessionId: sessionId
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
        .then(res => {
            if (res.ok) {
                return true;
            } else {
                throw new Error('some website cannot be added to anonymous');
            }
        })
}

function addModelToAnonymous(token, modelId) {
    const url = ACCOUNT_BASE_URL + "/addmodel";
    const body = {
        username: "anonymous",
        modelId: modelId
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    };
    return fetch(url, option)
        .then(res => {
            if (res.ok) {
                return true;
            } else {
                throw new Error('some website cannot be added to anonymous');
            }
        })
}


async function addAllExplorationToSession(sessionId) {
    const url = `${SESSION_BASE_URL}/${sessionId}/exploration/add`;

    const explorationsDirectory = path.join(__dirname, "..","explorations");
    const explorationList = JSON.parse(fs.readFileSync(path.join(explorationsDirectory, "demo.json"), "utf8")).explorationList;

    for (const exploration of explorationList) {
        const body = {
            testerName: exploration.testerName,
            interactionList: exploration.interactionList
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        await fetch(url, option)
            .then(res => {
                if (res.ok) {
                    return true;
                } else {
                    throw new Error('some website cannot be added to anonymous');
                }
            })
    }
    return true;
}
