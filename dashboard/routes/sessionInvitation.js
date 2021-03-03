const fetch = require('node-fetch');
const buildInvitation = require("../invitations").buildInvitation;

const logger = require('../logger');


module.exports = function attachRoutes(app, config) {

    app.get('/join', (req, res) => {
        const { modelId, sessionId } = req.query;

        logger.info(`GET join session (modelId = ${modelId}), (sessionId = ${sessionId})`);
        const sessionURL = 'http://' + config.session.host + ':' + config.session.port + '/session/'+sessionId;
        const modelURL = 'http://' + config.model.host + ':' + config.model.port + '/model/'+modelId;
        
        const sessionPromise = fetch(sessionURL, {});
        const modelPromise = fetch(modelURL, {});

        Promise.all([sessionPromise, modelPromise])
            .then(([responseSession, responseModel]) => {
                if (responseSession.ok && responseModel.ok ) {
                    return Promise.all([responseSession.json(), responseModel.json()]);
                } else {
                    let msg = `session:${responseSession.statusText}, model:${responseModel.statusText}`
                    throw new Error(msg);
                }
            })
            .then(([session, model]) => {
                res.render('session/invitation.ejs', {
                    account: req.session,
                    serverURL: buildInvitation(model.id, session.id),
                    connectionCode: `${session.id}$${model.id}`,
                    session, 
                    model,
                    });
            })
            .catch(e => {
                logger.error(e);
                let message = 'Cannot view the session';
                res.render('error.ejs', {message, error:e, account: req.session})
            });
    });
}