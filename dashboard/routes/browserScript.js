const logger = require('../logger');
const fs = require('fs');

module.exports = function attachRoutes(app, config) {

    app.use(function (req, res, next) {
        if (req.session) {
            logger.info('session', req.session.id);
            if (req.session.browserScript === undefined) {
                logger.info("No browser script found in session");
                if (app.browserScript) {
                    logger.info("Using browser script from file");
                    req.session.browserScript = app.browserScript;
                }
            }
        } else {
            logger.info("No session found");
        }
        next();
    });

    app.post('/browser-script', (req, res) => {
        logger.info(`browser script`);
        let {isEnabled,connexionURL} = req.body;
        let browserScript = {
            isEnabled,
            connexionURL
        }
        try {
            fs.writeFileSync('browser-script.json', JSON.stringify(browserScript));
            app.browserScript = browserScript;
            res.status(200).json(JSON.stringify(browserScript));
            logger.info(`browser script activated`);
        } catch (e) {
            res.status(500).json({message:'not ok'});
            logger.error(e);
        }
    });
}

