const fetch = require('node-fetch');
const config = require('../config');
const { token2WebSite } = require('../tokenUtilities');
const addWebSite = require('../tokenUtilities').addWebSite;
const removeWebSite = require('../tokenUtilities').removeWebSite;
const requestWebSiteFromToken = require('../tokenUtilities').requestWebSiteFromToken;
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/website/start', (req, res) => {
        res.render('website/start.ejs', {account:req.session});
    });

    app.get('/dashboard/website/create', (req, res) => {
        let firstWebSite = token2WebSite(req.session.jwt).length == 0;
        res.render('website/create.ejs', {
            account:req.session,
            webSite: undefined,
            errorMessage: null,
            firstWebSite
        });
    });

    app.post('/dashboard/website/create', (req, res) => {
        let {name, url, mappingList} = req.body;
        logger.info(`POST create WebSite (name : ${name}, url : ${url})`)

        let webSite = {
            name,
            url,
            mappingList
        }
        let renderOption = {
            account: req.session,
            webSite: { 
                id: webSite.id,
                name: webSite.name, 
                url, 
                mappingList: webSite.mappingList
            },
            successMessage: undefined,
            errorMessage: undefined,
            firstWebSite: false
        }
        try  {
            webSite.mappingList = JSON.parse(mappingList);
        } catch(e) {
            logger.error('cannot parse mappingList:',e);
            renderOption.errorMessage = e.message;
            res.render('website/create.ejs', renderOption);
            return;
        }

        renderOption.errorMessage = checkMappingRuleList(webSite.mappingList);
        if (renderOption.errorMessage !== undefined) {
            res.render('website/create.ejs', renderOption);
            return;
        }

        const webSiteCreateURL = 'http://' + config.website.host + ':' + config.website.port + '/website/create';
        let optionWebSiteCreate = {
            method: 'POST',
            body:    JSON.stringify(webSite),
            headers: { 'Content-Type': 'application/json' },
        }
        fetch(webSiteCreateURL, optionWebSiteCreate)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw response.statusText
                }
            })
            .then(webSiteId => {
                renderOption.webSite.id = webSiteId;
                return addWebSite(req.session.jwt , webSiteId)
            })
            .then(token => {
                req.session.jwt = token.jwt;
                renderOption.successMessage = "WebSite has been created";
                logger.info(renderOption.successMessage);
                res.render('website/update.ejs', renderOption)
            })
            .catch((error) => {
                logger.error(error);
                renderOption.errorMessage = 'Creation Failed';
                res.render('website/create.ejs', renderOption);
            })
    })

    app.post('/dashboard/website/update', (req, res) => {
        let {id, name, url, mappingList} = req.body;
        logger.info(`POST update WebSite (id: ${id}, name : ${name}, url : ${url})`)
        let webSite = {
            id,
            name,
            url,
            mappingList
        }
        let renderOption = {
            account: req.session,
            webSite: {
                id,
                name, 
                url, 
                mappingList
            },
            successMessage: undefined,
            errorMessage: undefined
        }
        try  {
            webSite.mappingList = JSON.parse(mappingList);
        } catch(e) {
            logger.error('cannot parse:',e);
            renderOption.errorMessage = e.message;
            res.render('website/update.ejs', renderOption);
            return;
        }

        renderOption.errorMessage = checkMappingRuleList(webSite.mappingList);
        if (renderOption.errorMessage !== undefined) {
            logger.error('cannot check:',e);
            res.render('website/update.ejs', renderOption);
            return;
        }

        const webSiteUpdateURL = 'http://' + config.website.host + ':' + config.website.port + '/website/update';
        let optionWebSiteCreate = {
            method: 'POST',
            body:    JSON.stringify(webSite),
            headers: { 'Content-Type': 'application/json' },
        }
        fetch(webSiteUpdateURL, optionWebSiteCreate)
            .then(response => {
                if (response.ok) {
                    renderOption.successMessage = 'WebSite has been saved';
                    logger.info(`WebSite updated`);
                    res.render('website/update.ejs', renderOption);
                } else {
                    renderOption.errorMessage = response.statusText;
                    res.render('website/update.ejs', renderOption);
                }
            })
            .catch( error => {
                logger.error(error);
                renderOption.errorMessage = "update failed.";
                res.render('website/update.ejs', renderOption);
            })
    });

    app.get('/dashboard/website/update/:webSiteId', (req, res) => {
        const {webSiteId} = req.params;
        logger.info(`GET WebSite update page (id : ${webSiteId})`);
        let webSiteData;
        requestWebSiteFromToken(req.session.jwt)
            .then(webSiteList => {
                if (!webSiteList) {
                    throw new Error("Update "+webSiteId+" forbidden");
                }
                webSiteData = webSiteList.find(webSite => webSite.id === webSiteId);
                if (webSiteData) {
                    webSite = { 
                        id: webSiteData.id,
                        url: webSiteData.url,
                        name: webSiteData.name, 
                        mappingList: webSiteData.mappingList
                    }
                }
                else {
                    throw new Error("No website found");
                }                
                res.render('website/update.ejs', {account:req.session, webSite, errorMessage: undefined, successMessage: undefined});
            }) 
            .catch(e => {
                logger.error(e);
                res.render('error.ejs', {account:req.session, message: e, error: undefined });
            })
            
    });

    app.get('/dashboard/website/remove/:webSiteId', (req, res) => {
        const {webSiteId} = req.params;
        logger.info(`GET remove WebSite`);
        removeWebSite(req.session.jwt , webSiteId)
            .then(token => {
                req.session.jwt = token.jwt;
                res.redirect('/account/account');
            })
    });

    app.get('/dashboard/website/:name', (req, res) => {
        const {name} = req.params;
        logger.info(`GET WebSite`);
        const webSiteURL = 'http://' + config.website.host + ':' + config.website.port + '/website/'+name;
        fetch(webSiteURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('website cannot be created', response.message);
                }
                return response.json();
            })
            .then( webSite => {
                logger.error(webSite);
                res.status(200).send(webSite);
            })
    });
}

function checkMappingRuleList(mappingRuleList) {
    for (let index = 0; index < mappingRuleList.length; index++) {
        let mappingRule = mappingRuleList[index];
   
        if (!mappingRule.hasOwnProperty('match')) {
            return `No match part found for rule number ${index+1}`;
            
        }
        if (!mappingRule.match.hasOwnProperty('css') && !mappingRule.match.hasOwnProperty('xpath')) {
            return `No selector part found for rule number ${index+1}`;
            
        }
        if (!mappingRule.match.hasOwnProperty('event')) {
            return `No event part found for rule number ${index+1}`;
            
        }
        if (!mappingRule.hasOwnProperty('output')) {
            return `No output part found for rule number ${index+1}`;
            
        }
        if (!mappingRule.output.hasOwnProperty('prefix')) {
            return `No prefix part found for rule number ${index+1}`;
        }
    }
}


