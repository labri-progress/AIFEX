const fetch = require('node-fetch');
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {


    app.get('/dashboard/evaluator/:sessionId', (req, res) => {
        let errorMessage;
        let renderOptions
        const sessionId = req.params.sessionId;
        let webSiteId;
        logger.info(`GET evaluation for website (sessionId : ${sessionId})`);
        
        const URLsession = 'http://' + config.session.host + ':' + config.session.port + '/session/' + req.params.sessionId;

        fetch(URLsession)
            .then(sessionResponse => sessionResponse.json())
            .then(session => {
                webSiteId = session.webSite.id
                const URLwebSite = 'http://' + config.website.host + ':' + config.website.port + '/website/'+ webSiteId;
                return fetch(URLwebSite)
            })
            .then(webSiteResponse => webSiteResponse.json())
            .then(webSite => {
                const actionList = webSite.mappingList.map(mapping => {
                    if (mapping.output.suffix) {
                        return `${mapping.output.prefix}$${mapping.output.suffix}` 
                    } else {
                        return `${mapping.output.prefix}` 
                    }
                }).sort()
                renderOptions = {
                    webSite,
                    actionList, 
                    sessionId,
                    description: "",
                    account: req.session, 
                    errorMessage,
                    isUpdate: false,
                    evaluatorExpression: undefined
                }
                if (webSite) {
                    const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/' + sessionId;
                    return fetch(URL, {
                        method: 'GET',
                        headers: {
                        Accept: 'application/json',
                        },
                    })
                } else {
                    logger.error(`You don\'t have access to this webSite. you cannot create an evaluator`);
                    throw new Error('You don\'t have access to this webSite. you cannot create an evaluator')
                }
            })
            .then((response) => {
                if (!response.ok) {
                    logger.error(`Failed to check for existing evaluator: ${response.message}`);
                    throw new Error('Failed to check for existing evaluator', response.message);
                } else if (response.status === 204) {
                    renderOptions.isUpdate = false;
                    return;
                } else {
                    return response.json();
                }
            })
            .then((evaluator) => {
                logger.debug(`return evaluator ${evaluator}`);
                if (evaluator) {
                    renderOptions.evaluatorExpression = evaluator.expression
                    renderOptions.description = evaluator.description;
                    renderOptions.isUpdate = true;
                }
                res.render('evaluation/create.ejs', renderOptions);
            })
            .catch(error => {
                logger.error(`${error}`);
                let message = 'Error when fetching WebSite from Security Token';
                res.render('error.ejs', {message,error, account:req.session});
            })
    });

    app.post('/dashboard/evaluation/create', (req, res) => {
        const {sessionId, evaluatorExpression, description} = req.body;
        if (evaluatorExpression.length === 0) {
            res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error:e});
            return;
        } 
        
        logger.info(`POST create evaluation for session (id = ${sessionId})`);
        const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/create'
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                sessionId,
                description,
                expression: evaluatorExpression,
            }),
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            if (response.ok) {
                return res.redirect("/account/account");
            } else {
                throw new Error(response.message);
            }
        }).catch( e => {
            let message = 'Failed to create evaluator';
            logger.error(`${e}`);
            res.render('error.ejs', {message, account: req.session, error:e});
        })
    })

    app.get('/dashboard/evaluator/remove/:sessionId', (req,res) => {
        const sessionId = req.params.sessionId;
        logger.info(`GET remove evaluation for session (id = ${sessionId})`);
        const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/remove/' + sessionId;
        return fetch(URL, {
            method: 'POST',
        }).then((response) => {
            console.log(response, response.ok, response.status)

            if (response.ok) {
                res.redirect(req.get('referer'));
            } else {
                logger.error(`${response.message})`);
                throw new Error(response.message);
            }
        }).catch( e => {
            let message = 'Failed to remove evaluator';
            logger.error(`${e}`);
            res.render('error.ejs', {message, account: req.session, error:e});
        })
    })

    app.post('/dashboard/evaluation/update', (req, res) => {
        const {sessionId, evaluatorExpression, description} = req.body;
        logger.info(`POST update evaluation for session (id = ${sessionId})`);
        const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/update'

        if (evaluatorExpression.length === 0) {
            res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error: new Error("Evaluator cannot be empty")});
            return;
        } 
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                sessionId,
                description,
                expression: evaluatorExpression,
            }),
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            if (response.ok) {
                return res.redirect("/account/account");
            } else {
                logger.error(`${response.message})`);
                throw new Error(response.message);
            }
        }).catch( e => {
            let message = 'Failed to update evaluator';
            logger.error(`${e}`);
            res.render('error.ejs', {message, account: req.session, error:e});
        })
    });

    app.post("/dashboard/evaluation/expressionToDot", (req, res) => {
        const { expression } = req.body;

        logger.info(`POST create dot from evaluation`);

        if (expression && expression.length > 0) {
            const checkEvaluatorValidityURL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/expressionToDot';
            fetch(checkEvaluatorValidityURL, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    expression
                })
            }).then(response => {
                return response.json()
            }).then(({expressionIsValid, dot}) => {
                res.status(200).send({expressionIsValid, dot});
            }).catch(error => {
                logger.error(error);
                let message = 'Error when checking expression validity';
                res.render('error.ejs', {message,error:e, account:req.session});
            })
        } else {
            res.status(200).send({expressionIsValid: true})
        }
    })
    
}
