const { getWebSites, createWebSite, removeWebSite, updateWebSite } = require('../service/apiService');
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/website/start', (req, res) => {
        res.render('website/start.ejs', { account: req.session });
    });

    app.get('/dashboard/website/create', (req, res) => {
        let firstWebSite = getWebSites(req.session.jwt).length == 0;
        res.render('website/create.ejs', {
            account: req.session,
            webSite: undefined,
            errorMessage: null,
            firstWebSite
        });
    });

    app.post('/dashboard/website/create', (req, res) => {
        let { name, mappingList } = req.body;
        logger.info(`Create WebSite (name : ${name})`)

        let renderOption = {
            account: req.session,
            webSite: {
                id: undefined,
                name: name,
                mappingList: mappingList
            },
            successMessage: undefined,
            errorMessage: undefined,
            firstWebSite: false
        }
        try {
            mappingList = JSON.parse(mappingList);
        } catch (e) {
            logger.error('cannot parse mappingList:', e);
            renderOption.errorMessage = e.message;
            res.render('website/create.ejs', renderOption);
            return;
        }

        renderOption.errorMessage = checkMappingRuleList(mappingList);
        if (renderOption.errorMessage !== undefined) {
            res.render('website/create.ejs', renderOption);
            return;
        }

        createWebSite(req.session.jwt, name, mappingList)
            .then(result => {
                renderOption.webSite.id = result;
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
        let { id, name, mappingList } = req.body;
        logger.info(`Update WebSite (id: ${id}, name : ${name})`)
        logger.debug(`mapping rules : ${JSON.stringify(mappingList)}`)
        let renderOption = {
            account: req.session,
            webSite: {
                id,
                name,
                mappingList
            },
            successMessage: undefined,
            errorMessage: undefined
        }
        try {
            mappingList = JSON.parse(mappingList);
        } catch (e) {
            logger.error('cannot parse:', e);
            renderOption.errorMessage = e.message;
            res.render('website/update.ejs', renderOption);
            return;
        }

        renderOption.errorMessage = checkMappingRuleList(mappingList);
        if (renderOption.errorMessage !== undefined) {
            logger.error('cannot check:', renderOption.errorMessage);
            res.render('website/update.ejs', renderOption);
            return;
        }

        updateWebSite(req.session.jwt, id, name, mappingList)
            .then(() => {
                renderOption.successMessage = 'WebSite has been saved';
                logger.info(`WebSite updated`);
                res.render('website/update.ejs', renderOption);
            })
            .catch(error => {
                logger.error(error);
                renderOption.errorMessage = "update failed.";
                res.render('website/update.ejs', renderOption);
            })
    });

    app.get('/dashboard/website/update/:webSiteId', (req, res) => {
        const { webSiteId } = req.params;
        logger.info(`Update WebSite page (id : ${webSiteId})`);
        let webSiteData;
        getWebSites(req.session.jwt)
            .then(webSiteList => {
                if (!webSiteList) {
                    throw new Error("Update " + webSiteId + " forbidden");
                }
                webSiteData = webSiteList.find(webSite => webSite.id === webSiteId);
                if (webSiteData) {
                    webSite = {
                        id: webSiteData.id,
                        name: webSiteData.name,
                        mappingList: webSiteData.mappingList
                    }
                }
                else {
                    throw new Error("No website found");
                }
                res.render('website/update.ejs', { account: req.session, webSite, errorMessage: undefined, successMessage: undefined });
            })
            .catch(e => {
                logger.error(e);
                res.render('error.ejs', { account: req.session, message: e, error: undefined });
            })

    });

    app.get('/dashboard/website/remove/:webSiteId', (req, res) => {
        const { webSiteId } = req.params;
        logger.info(`Remove WebSite`);
        removeWebSite(req.session.jwt, webSiteId)
            .then(() => {
                res.redirect('/account/account');
            })
    });

}

function checkMappingRuleList(mappingRuleList) {
    for (let index = 0; index < mappingRuleList.length; index++) {
        let mappingRule = mappingRuleList[index];

        if (!mappingRule.hasOwnProperty('match')) {
            return `No match part found for rule number ${index + 1}`;

        }
        if (!mappingRule.match.hasOwnProperty('css') && !mappingRule.match.hasOwnProperty('xpath')) {
            return `No selector part found for rule number ${index + 1}`;

        }
        if (!mappingRule.match.hasOwnProperty('event')) {
            return `No event part found for rule number ${index + 1}`;

        }
        if (!mappingRule.hasOwnProperty('output')) {
            return `No output part found for rule number ${index + 1}`;

        }
        if (!mappingRule.output.hasOwnProperty('prefix')) {
            return `No prefix part found for rule number ${index + 1}`;
        }
    }
}


