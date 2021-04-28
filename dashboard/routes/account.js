const fetch = require('node-fetch');
const requestWebSiteFromToken = require('../tokenUtilities').requestWebSiteFromToken;
const verify = require('../tokenUtilities').verify;
const requestSessionFromToken = require('../tokenUtilities').requestSessionFromToken;
const token2Session = require('../tokenUtilities').token2Session;
const buildInvitation = require("../invitations").buildInvitation;
const logger = require('../logger');

module.exports = function attachRoutes(app, config) {

    app.use((req, res, next) => {
        logger.info('use account');
        if (req.session.jwt) {
            logger.debug('token');
            if (verify(req.session.jwt)) {
                next();
                return;
            } else {
                req.session.jwt = undefined;
                req.session.username = undefined;
                res.redirect('/');
                return;
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
        //console.log('sign', username, password);
        signin(username, password)
            .then(token => {
                //console.log("token ok:", token);
                req.session.jwt = token.jwt;
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
            .then(token => {
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
        let webSiteList;
        let sessionList;
        logger.info(`GET account.ejs`);
        requestWebSiteFromToken(req.session.jwt)
            .then(requestedWebSiteList => {
                webSiteList = requestedWebSiteList;
                return requestSessionFromToken(req.session.jwt);
            })
            .then(requestedSessionList => {
                sessionList = requestedSessionList;
                const connectionCodeList = token2Session(req.session.jwt);
                const serveurURLList = token2Session(req.session.jwt).map(connectionCode => {
                    const [sessionId, modelId] = connectionCode.split('$');
                    return buildInvitation(modelId, sessionId);
                })
                res.render('account/account.ejs', {account:req.session, serveurURLList, connectionCodeList, webSiteList, sessionList});
            })
            .catch(e => {
                logger.error(`error ${e}`);
                res.render('error.ejs',{account:req.session, message:'cannot read account', error:e})
            })
    });

    function signup(username, email, password) {
        logger.info(`signup`);
        const accountURL = 'http://' + config.account.host + ':' + config.account.port + '/account/signup';
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
                            .then(createdUsername => {
                                res(createdUsername);
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
        const accountURL = 'http://' + config.account.host + ':' + config.account.port + '/account/signin';
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

