import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import * as winston from "winston";

const API_URL = `http://localhost/api`;

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

pingThenLoadDefault();

function pingThenLoadDefault() {
    logger.info(`ping api`);
    const API_PING_URL = `${API_URL}/ping`;

    return fetch(API_PING_URL)
    .then((resPing) => {
        if (resPing.ok) {
            loadingAnonymousAccount();
        } else {
            setTimeout(pingThenLoadDefault, 4000);
        }
    })
    .catch( e => {
        setTimeout(pingThenLoadDefault, 4000);
    })
}

async function loadingAnonymousAccount() {
    logger.info(`Loading anonymous account`);
    try {
        await createAnonymousAccount();
        const tokenJWT = await signinAsAnonymous();
        const token = tokenJWT.bearerToken;
        const webSiteList = await createDefaultWebSite(token);
        const cdiscountWebSiteId = webSiteList.find(webSite => webSite.name === 'cdiscount')._id;
        logger.info(`cdiscountWebSiteID:${cdiscountWebSiteId}`);

        const connexionCode = await createSessionAndModel(token, cdiscountWebSiteId);
        const sessionId = connexionCode.split('$')[0];
        logger.info('sessionAddedToAnonymous');

        await addAllExplorationToSession(token, sessionId);
        logger.info('allExplorationToSession');
    } catch (e) {
        logger.error(e);
    }    
}

async function createDefaultWebSite(token) {
    logger.info(`createDefaultWebSite`)
    const mappingDirectory = path.join(__dirname, "..","mapping");

    const siteList = JSON.parse(fs.readFileSync(path.join(mappingDirectory, "siteList.json"), "utf8"));
    for (const site of siteList) {
        site._id = await createSite(token, site);
        let mappingList = [];
        for (const mappingfile of site.mappingFiles) {
            const mapPath = path.join(mappingDirectory, mappingfile);
            const mapping = JSON.parse(fs.readFileSync(mapPath, "utf8"));
            mappingList = mappingList.concat(mapping);
        }
        await addMappingListToWebSite(token, site, mappingList);
    }
    logger.info("default website are loaded");
    return siteList;
}


function createSite(token, site) {
    const url = API_URL + "/websites";
    const body = {
        name: site.name,
        mappingList: [],
    };
    console.log(token)
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }    
    return fetch(url, option)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('website cannot be created');
        }

    })
}

function addMappingListToWebSite(token, site, mappingList) {
    const url = API_URL + "/websites/" + site._id.webSiteId;
    const body = {
        name: site.name,
        mappingList
    };
    const option = {
        method: "PATCH",
        body:    JSON.stringify(body),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
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
    const url = API_URL + "/signup";
    const body = {
        username: "anonymous",
        password: "anonymous",
        email: "anonymous@email.com"
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
    const url = API_URL + "/signin";
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

function createSessionAndModel(token, webSiteId) {
    const baseURL = "https://www.cdiscount.com";
    const depth = 8;
    const interpolationfactor = 2;

    let sessionId;
    let modelId;

    const sessionCreateURL = API_URL + '/sessions/';
    const bodySessionCreate = {
        webSiteId,
        baseURL,
    }
    const optionSessionCreate = {
        method: 'POST',
        body:    JSON.stringify(bodySessionCreate),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }

    const modelCreateURL =API_URL + '/models/';
    const bodyModelCreate = {
        depth,
        interpolationfactor
    }
    const optionModelCreate = {
        method: 'POST',
        body:    JSON.stringify(bodyModelCreate),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
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
        let linkModel2SessionURL = API_URL + '/models/' + modelId + "/link/" + sessionId;
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

async function addAllExplorationToSession(token, sessionId) {
    const url = `${API_URL}/${sessionId}/explorations`;

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
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }        
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
