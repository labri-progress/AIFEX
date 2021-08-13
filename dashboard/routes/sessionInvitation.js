const { getSessionById, getModelById } = require('../apiService');
const buildInvitation = require("../invitations").buildInvitation;

const logger = require('../logger');


module.exports = function attachRoutes(app, config) {

    app.get('/join', (req, res) => {
        const { modelId, sessionId } = req.query;

        logger.info(`GET join session (modelId = ${modelId}), (sessionId = ${sessionId})`);
        

        Promise.all([getSessionById(req.session.token, sessionId), getModelById(req.session.token, modelId)])
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