const {signin, signup, getAccount , getWebSites, getSessions, getModels} = require('../service/apiService');
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.use((req, res, next) => {
        logger.info('use account');
        if (req.session.jwt) {
            logger.debug('token is found');
            if (req.session.username) {
                logger.debug('username is found');
                next();
            } else {
                getAccount(req.session.jwt)
                    .then(account => {
                        if (account) {
                            logger.debug(`get username: ${account.username}`);
                            req.session.username = account.username;
                            next();
                            return;
                        } else {
                            logger.debug(`cannot get account`);
                            req.session.jwt = undefined;
                            req.session.username = undefined;
                            res.redirect('/');
                            return;
                        }
                    })
                    .catch(err => {
                        logger.error('Error cannot get account');
                        logger.error(err);
                        req.session.jwt = undefined;
                        res.redirect('/');
                        return;
                    })
            }
        } else {
            logger.debug('no token');
            if (req.originalUrl === '/' || req.originalUrl === '') {
                next();
                return;
            }

            if (req.originalUrl === '/account/signin') {
                next();
                return;
            }

            if (req.originalUrl === '/account/signup') {
                next();
                return;
            }

            if (req.originalUrl.startsWith('/study/')) {
                next();
                return;
            }

            if (req.originalUrl.startsWith('/documentation')) {
                next();
                return;
            }

            if (req.originalUrl.startsWith('/join')) {
                next();
                return;
            }

            if (req.originalUrl.startsWith('/open')) {
                next();
                return;
            }
    
            if (req.originalUrl === '/us') {
                next();
                return;
            }

            if (req.originalUrl === '/survey') {
                next();
                return;
            }
    
            if (req.originalUrl === '/download') {
                next();
                return;
            }
            
            if (req.originalUrl === '/plugin-info') {
                next();
                return;
            }
    
            res.redirect('/account/signin');
            return;
        }
    })

    app.get('/account/signin', (req, res) => {
        logger.info(`Get signin.ejs page`);
        res.render('account/signin.ejs', {account:req.session, kind:undefined});
    });

    app.post('/account/signin', (req, res) => {
        const { username , password} = req.body;
        logger.info(`Signin for ${username}`);
        signin(username, password)
            .then(result => {
                if (result === "IncorrectUsernameOrPassword") {
                    logger.debug("token nok:", result);
                    res.render('account/signin.ejs', {account:req.session, kind:'danger', message:"Incorrect username or password."})
                } else {
                    logger.debug("token ok:", result);
                    req.session.jwt = result;
                    req.session.username = username;
                    res.redirect('/account/account');
                }
            })
            .catch(reason => {
                logger.error(`error ${reason}`);
                console.log('error', reason);
                res.render('account/signin.ejs', {account:req.session, kind:'danger', message:"Server Error"})
            })
    });

    app.get('/account/signup', (req, res) => {
        logger.info(`Get signup.ejs page`);
        res.render('account/signup.ejs', {account:req.session, kind:undefined});
    });

    app.post('/account/signup', (req, res) => {
        const { username , email, password} = req.body;
        logger.info(`signup for ${username}`);
        //console.log('sign', username, password);
        signup(username, email, password)
            .then((result) => {
                if (result === "UserNameAlreadyTaken") {
                    logger.debug(`sign up nok, UserNameAlreadyTaken`);
                    res.render('account/signup.ejs', {account:req.session, kind:'danger', message:"Cannot create account. Try with another username."})
                } else {
                    logger.debug(`sign up ok`);
                    res.render('account/signin.ejs', {account:req.session, kind:undefined});
                }
            })
            .catch(reason => {
                logger.error(`error ${reason}`);
                //console.log('error', reason);
                res.render('account/signup.ejs', {account:req.session, kind:'danger', message:"Cannot create account. Try with another username."})
            })
    });

    app.get('/account/signout', (req, res) => {
        logger.info(`signout`);
        req.session.jwt = undefined;
        req.session.username = undefined;
        res.redirect('/');
    });

    app.get('/account/account', (req, res) => {
        logger.info("get account page")

        Promise.all([getWebSites(req.session.jwt),getSessions(req.session.jwt),getModels(req.session.jwt)])
            .then(([webSiteList, sessionList, modelList]) => {
                let serveurURLList = [];
                let connectionCodeList = [];
                sessionList.forEach(session => {
                    logger.debug(`session ${JSON.stringify(session.id)}`);
                    let model4Session = modelList.find(model => model.sessionIdList.includes(session.id));
                    connectionCodeList.push(`${session.id}$${model4Session.id}`);
                    serveurURLList.push(`${process.env.PROTOCOL}://${process.env.HOST_ADDR}/join?sessionId=${session.id}&modelId=${model4Session.id}`);
                });
                res.render('account/account.ejs', {account:req.session, serveurURLList, connectionCodeList, webSiteList, sessionList});
            })
            .catch(e => {
                logger.error(`error ${e}`);
                res.render('error.ejs',{account:req.session, message:'cannot read account', error:e})
            })
    });

}

