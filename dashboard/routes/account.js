const fetch = require('node-fetch');
const getAccount = require('../apiService').getAccount;
const buildInvitation = require("../invitations").buildInvitation;
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.use((req, res, next) => {
        logger.info('use account');
        if (req.session.jwt) {
            logger.debug('token');
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
                });
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
    
            if (req.originalUrl.indexOf('/dashboard/session/view/') !== -1 ) {
                next();
                return;
            }

            res.redirect('/account/signin');
            return;
        }
    })

    app.get('/account/signin', (req, res) => {
        logger.info(`GET signin.ejs`);
        res.render('account/signin.ejs', {account:req.session, kind:undefined});
    });

    app.post('/account/signin', (req, res) => {
        const { username , password} = req.body;
        logger.info(`POST sign for ${username}`);
        signin(username, password)
            .then(token => {
                logger.debug("token ok:", token);
                req.session.jwt = token.bearerToken;
                req.session.username = username;
                logger.debug(`sign ok`);
                res.redirect('/');
            })
            .catch(reason => {
                logger.error(`error ${reason}`);
                //console.log('error', reason);
                res.render('account/signin.ejs', {account:req.session, kind:'danger', message:"Incorrect username or password."})
            })
    });

    app.get('/account/signup', (req, res) => {
        logger.info(`GET signin.ejs`);
        res.render('account/signup.ejs', {account:req.session, kind:undefined});
    });

    app.post('/account/signup', (req, res) => {
        const { username , email, password} = req.body;
        logger.info(`POST sign for ${username}`);
        //console.log('sign', username, password);
        signup(username, email, password)
            .then(() => {
                logger.debug(`sign up ok`);
                res.render('account/signin.ejs', {account:req.session, kind:undefined});
            })
            .catch(reason => {
                logger.error(`error ${reason}`);
                //console.log('error', reason);
                res.render('account/signup.ejs', {account:req.session, kind:'danger', message:"Cannot create account. Try with another username."})
            })
    });

    app.get('/account/signout', (req, res) => {
        logger.info(`GET signout`);
        req.session.jwt = undefined;
        req.session.username = undefined;
        res.redirect('/');
    });

    app.get('/account/account', (req, res) => {
        // logger.info("/account/account")
        // let webSiteList;
        // let sessionList;
        // logger.info(`GET account.ejs`);
        // getWebSites(req.session.jwt)
        //     .then(requestedWebSiteList => {
        //         webSiteList = requestedWebSiteList;
        //         return getSessions(req.session.jwt);
        //     })
        //     .then(requestedSessionList => {
        //         sessionList = requestedSessionList;
        //         const connectionCodeList = authorizationSet2Session(req.session.authorizationSet);
        //         const serveurURLList = authorizationSet2Session(req.session.authorizationSet).map(connectionCode => {
        //             const [sessionId, modelId] = connectionCode.split('$');
        //             return buildInvitation(modelId, sessionId);
        //         })
        //         res.render('account/account.ejs', {account:req.session, serveurURLList, connectionCodeList, webSiteList, sessionList});
        //     })
        //     .catch(e => {
        //         logger.error(`error ${e}`);
        //         res.render('error.ejs',{account:req.session, message:'cannot read account', error:e})
        //     })
    });

    function signup(username, email, password) {
        logger.info(`signup`);
        const accountURL = 'http://' + config.api.host + ':' + config.api.port + '/signup';
        let bodySignup = {
            username,
            email,
            password
        }
        let optionSignup = {
            method: 'POST',
            body:    JSON.stringify(bodySignup),
            headers: { 'Content-Type': 'application/json' },
        }
        return new Promise( (res, rej) => {
            fetch(accountURL, optionSignup)
                .then(responseAccount => {
                    if (responseAccount.ok) {
                        responseAccount.json()
                            .then(() => {
                                res();
                            })
                            .catch(e => {
                                rej(e);
                            })
                    } else {
                        rej({isUsernameExist: true});
                    }
                })
                .catch(e => {
                    rej(e);
                });
        });
    }

    function signin(username, password) {
        logger.info(`signin`);
        const accountURL = 'http://' + config.api.host + ':' + config.api.port + '/signin';
        let bodySignin = {
            username, 
            password
        }
        let optionSignin = {
            method: 'POST',
            body:    JSON.stringify(bodySignin),
            headers: { 'Content-Type': 'application/json' },
        }
        return new Promise((res, rej) => {
            fetch(accountURL, optionSignin)
                .then(responseAccount => {
                    if (responseAccount.ok) {
                        responseAccount.json()
                            .then(token => {
                                logger.info(`Logged in with token ${token}`)
                                res(token);
                            })
                            .catch(e => {
                                rej(e);
                            })
                    } else {
                        rej({isUsernamePasswordWrong:true});
                    }
                })
                .catch(e => {
                    rej(e);
                });
        })
    }

}

