const fetch = require('node-fetch');
const { getSessionById, getWebSiteById, getEvaluatorBySessionId, getEvaluatorExpressionDot, createEvaluator } = require('../service/apiService');

const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.get('/dashboard/evaluator/:sessionId', (req, res) => {
        let errorMessage;
        let renderOptions
        const sessionId = req.params.sessionId;
        let token = req.session.jwt;
        logger.info(`GET evaluator for website (sessionId : ${sessionId})`);

        getSessionById(token, sessionId)
            .then(session => {
                return getWebSiteById(token ,session.webSite.id)
            }).then((webSite) => {

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
                return getEvaluatorBySessionId(token, sessionId)
            })
            .then((evaluator) => {
                if (evaluator) {
                    renderOptions.evaluatorExpression = evaluator.expression
                    renderOptions.description = evaluator.description;
                    renderOptions.isUpdate = true;
                }
                res.render('evaluation/create.ejs', renderOptions);
            })
            .catch(error => {
                logger.error(`${error}`);
                res.render('error.ejs', {message,error, account:req.session});
            })
    });

    app.post('/dashboard/evaluation/create', (req, res) => {
        const {sessionId, evaluatorExpression, description} = req.body;
        let token = req.session.jwt;
        console.log(evaluatorExpression)
        if (evaluatorExpression.length === 0) {
            return res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error:e});
        } else {
            return createEvaluator(token, sessionId, evaluatorExpression, description).then((response) => {
                console.log("RESPONSES")
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
        } 
        
        
    })

    app.get('/dashboard/evaluator/remove/:sessionId', (req,res) => {
        const sessionId = req.params.sessionId;
        logger.info(`GET remove evaluation for session (id = ${sessionId})`);
        const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/remove/' + sessionId;
        return fetch(URL, {
            method: 'POST',
        }).then((response) => {
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
        const URL = 'http://' + config.evaluator.host + ':' + config.evaluator.port + '/evaluator/update/'+ sessionId

        if (evaluatorExpression.length === 0) {
            res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error: new Error("Evaluator cannot be empty")});
            return;
        } 
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
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
        return getEvaluatorExpressionDot(expression)
            .then(data => {
                return res.status(200).json(data);
            })
    })
    
}
