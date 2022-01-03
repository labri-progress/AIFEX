import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import * as winston from "winston";

let  API_URL = `http://reverseproxy/api`;
if (process.env.NODE_ENV === 'production') {
    API_URL = `https://reverseproxy/api`;
}


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
    const API_PING_URL = `${API_URL}/ping`;
    logger.info(`ping api: ${API_PING_URL}`);

    return fetch(API_PING_URL)
    .then((resPing) => {
        if (resPing.ok) {
            loadingAnonymousAccount();
        } else {
            logger.info(`ping api: ${API_PING_URL} failed: ${resPing}`);
            setTimeout(pingThenLoadDefault, 4000);
        }
    })
    .catch( e => {
        logger.error(`ping api: ${API_PING_URL} failed: ${e.message}`);
        setTimeout(pingThenLoadDefault, 4000);
    })
}

async function loadingAnonymousAccount() {
    logger.info(`Loading anonymous account`);
    let token;
    createAnonymousAccount()
    .then(() => {
        logger.info(`anonymous account is created`);	
    })
    .catch(() => {
        logger.info(`anonymous was already created`);
        throw new Error('anonymous account was already created');
    })
    .then(() => {
        return signinAsAnonymous();
    })
    .then((returnedToken) => {
        token = returnedToken;
        logger.info(`anonymous is signedin`);
        return createDefaultWebSite(token);
    })
    .then((webSiteList) => {
        logger.info(`default website are loaded`);
        const cdiscountWebSiteId = webSiteList.find(webSite => webSite.name === 'cdiscount')._id;
        logger.info(`cdiscount WebSite Id:${cdiscountWebSiteId}`);

        return createSessionAndModel(token, cdiscountWebSiteId);
    })
    .then((connexionCode) => {
        const sessionId = connexionCode.split('$')[0];
        logger.info('sessionAddedToAnonymous');

        return addAllExplorationToSession(token, sessionId);
    })
    .then(() => {
        logger.info('allExplorationToSession');
    })
    .catch ((error) => {
        logger.error(error);
        
        logger.info('initialization aborded');
    })
}

async function createDefaultWebSite(token) {
    logger.info(`createDefaultWebSite`)
    const mappingDirectory = path.join(__dirname, "..","mapping");

    const siteList = JSON.parse(fs.readFileSync(path.join(mappingDirectory, "siteList.json"), "utf8"));
    for (const site of siteList) {
        let mappingList = [];
        for (const mappingfile of site.mappingFiles) {
            const mapPath = path.join(mappingDirectory, mappingfile);
            const mapping = JSON.parse(fs.readFileSync(mapPath, "utf8"));
            mappingList = mappingList.concat(mapping);
        }
        let id = await createSite(token, site.name, site.url, mappingList);
        logger.debug(id);
        site._id = id;
    }
    return siteList;
}


function createSite(token, name, url, mappingList) {
    const CREATE_URL = API_URL + "/websites";
    const body = {
        name,
        url,
        mappingList
    };
    const option = {
        method: "POST",
        body:    JSON.stringify(body),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }    
    return fetch(CREATE_URL, option)
    .then(res => {
        if (res.ok) {
            logger.info(`Site (${name}) is created`);
            return res.json();
        } else {
            throw new Error('website cannot be created');
        }
    })
    .then((result) => {
         const webSiteId = result.webSiteId;
         return fetch(`${API_URL}/public/authorizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                kind: "WebSite",
                key: webSiteId,
            })
        })
        .then(() => {
            logger.debug(result);
            logger.debug(result.webSiteId);

            return result.webSiteId;
        })
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
    .then((json) => {
        return json.bearerToken;
    });
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
        overlayType: "rainbow",
        name: "example",
        description: "Just exploring the purchase funnel",
        recordingMode: "byexploration"
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
        interpolationfactor,
        predictionType: "CSP"
    }
    const optionModelCreate = {
        method: 'POST',
        body:    JSON.stringify(bodyModelCreate),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    logger.debug(`create session`);

    return fetch(sessionCreateURL, optionSessionCreate)
    .then( resSession => {
        if (resSession.ok) {
            return resSession.json().then(json => {
                sessionId = json.sessionId;
                logger.info(`sessionId: ${sessionId}`);
            });
        } else {
            throw new Error('session cannot be created');
        }
    })
    .then(() => {
        if (!sessionId) {
            throw new Error('session id is undefined');
        }
        logger.debug(`Making session public session`);
        logger.debug(`sessionId is : ${sessionId}`);

        return fetch(`${API_URL}/public/authorizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                kind: "Session",
                key: sessionId,
            })
        });
    })
    .then(() => {
        return fetch(modelCreateURL, optionModelCreate)
    })
    .then( resModel => {
        if (resModel.ok) { 
            return resModel.json().then(json => {
                modelId = json.modelId;
                logger.info(`modelId: ${modelId}`);
                fetch(`${API_URL}/public/authorizations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({
                        kind: "Model",
                        key: modelId,
                    })
                });
            });
        } else {
            throw new Error('model cannot be created');
        }
    })
    .then( () => {
        let linkModel2SessionURL = API_URL + '/models/' + modelId + "/link/" + sessionId;
        const optionLinkModel = {
            method: 'POST',
            body:    JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' , "Authorization": `Bearer ${token}` },
        }
        return fetch(linkModel2SessionURL, optionLinkModel);
    })
    .then( response => {
        if (!response.ok) {
            throw new Error('model cannot be linked to session');
        }
        logger.info(`model linked to session: ${response}`);
        return `${sessionId}$${modelId}`;
    });
}

async function addAllExplorationToSession(token, sessionId) {
    const url = `${API_URL}/sessions/${sessionId}/explorations`;

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
                    throw new Error('some exploration cannot be added to the session');
                }
            })
    }
    return true;
}
