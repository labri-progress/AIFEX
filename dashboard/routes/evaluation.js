const { getSessionById, getWebSiteById, getEvaluatorBySessionId, getEvaluatorExpressionDot, createEvaluator, deleteEvaluator, updateEvaluator } = require('../service/apiService');

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
        if (evaluatorExpression.length === 0) {
            return res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error:e});
        } else {
            return createEvaluator(token, sessionId, evaluatorExpression, description).then(() => {
                return res.redirect("/account/account");
            }).catch( e => {
                let message = 'Failed to create evaluator';
                logger.error(`${e}`);
                res.render('error.ejs', {message, account: req.session, error:e});
            })
        } 
    })

    app.get('/dashboard/evaluator/remove/:sessionId', (req,res) => {
        const sessionId = req.params.sessionId;
        let token = req.session.jwt;

        logger.info(`GET remove evaluation for session (id = ${sessionId})`);
        return deleteEvaluator(token, sessionId).then(() => {
            return res.redirect(req.get('referer'));
        }).catch( e => {
            let message = 'Failed to delete evaluator';
            logger.error(`${e}`);
            res.render('error.ejs', {message, account: req.session, error:e});
        })
    })

    app.post('/dashboard/evaluation/update', (req, res) => {
        const {sessionId, evaluatorExpression, description} = req.body;
        let token = req.session.jwt;
        if (evaluatorExpression.length === 0) {
            return res.render('error.ejs', {message: "Evaluator cannot be empty", account: req.session, error:e});
        } else {
            return updateEvaluator(token, sessionId, description, evaluatorExpression).then(() => {
                return res.redirect(req.get('referer'));
            }).catch( e => {
                let message = 'Failed to update evaluator';
                logger.error(`${e}`);
                res.render('error.ejs', {message, account: req.session, error:e});
            })
        } 
    });

    app.post("/dashboard/evaluation/expressionToDot", (req, res) => {
        const { expression } = req.body;
        if (expression && expression.length > 0) {
        return getEvaluatorExpressionDot(expression)
            .then(data => {
                return res.status(200).json(data);
            }).catch( e => {
                let message = 'Failed to evaluate expression';
                logger.error(`${e}`);
                res.render('error.ejs', {message, account: req.session, error:e});
            })
        }
    })
    
}
