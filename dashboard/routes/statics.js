const logger = require('../logger');
const { requestWebSiteFromAuthorizationSet, authorizationSet2Session } = require('../tokenUtilities');

module.exports = function attachRoutes(app, config) {

    // Experimental documentation using markdown
    // Hack for processing md files. Should modify ejs module 
    app.get('/study/with', (req, res) => {
        res.render('evaluation/instructions-with-evaluator.ejs', { account: req.session});
    })

    app.get('/study/without', (req, res) => {
        res.render('evaluation/instructions-without-evaluator.ejs', { account: req.session});
    })

    app.get('/study/without-proba', (req, res) => {
        res.render('evaluation/instructions-without-probabilities.ejs', { account: req.session});
    })

    app.get('/study/evaluator-without-proba', (req, res) => {
        res.render('evaluation/instructions-evaluator-without-proba.ejs', { account: req.session });
    })


    app.get('/documentation', (req, res) => {
        res.render('documentation/doc.ejs', { account: req.session});
    })

    app.get('/documentation-website', (req, res) => {
        res.render('documentation/doc-website.ejs', { account: req.session});
    })

    app.get('/documentation-extension', (req, res) => {
        res.render('documentation/doc-extension.ejs', { account: req.session});
    })

    app.get('/us', (req, res) => {
        res.render('documentation/aboutus.ejs', { account: req.session});
    })

    app.get('/survey', (req, res) => {
        res.render('study/stvr.ejs', { account: req.session});
    })

    app.get('/download', (req, res) => {
        let PLUGIN_INFO;
        if (process.env.PLUGIN_INFO) {
            PLUGIN_INFO = JSON.parse(process.env.PLUGIN_INFO);
        }
        const chromeStoreURL = config.chromeStoreURL;
        const firefoxStoreURL = config.firefoxStoreURL;
        res.render('documentation/download.ejs', { account: req.session, chromeStoreURL, firefoxStoreURL, PLUGIN_INFO});
    });

    app.get('/plugin-info', (req, res) => {
        logger.info('GET plugin info');
        if (!process.env.PLUGIN_INFO) {
            return res.send({})
        } else {
            try {
                const info = JSON.parse(process.env.PLUGIN_INFO)
                return res.send({
                    version: info.version,
                    name: info.name,
                    description: info.description
                })
            } catch(error) {
                logger.error(error);
                return res.send({})
            }
        }
    })

    app.get('/', (req, res) => {
        if (req.session.jwt) {
            requestWebSiteFromAuthorizationSet(req.session.authorizationSet)
            .then(webSiteList => {
                let sessionList = authorizationSet2Session(req.session.authorizationSet);
                res.render('index.ejs', { account: req.session , webSiteList, sessionList});    
            })
        } else {
            res.render('index.ejs', { account: req.session , webSiteList: []});
        }
    });




}