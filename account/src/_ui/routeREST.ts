import AccountService from "../application/AccountService";
import Token from "../domain/Token";
import Authorization from "../domain/Authorization";
import { Kind } from "../domain/Kind";
import e, { Response, Express } from "express";
import {logger} from "../logger";

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app : Express, accountService: AccountService) {
    app.get("/account/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.post("/account/signup", (req, res) => {
        let {username, email, password} = req.body;
        if (email === undefined) {
            email = "nomail";
        }
        logger.info(`signup`);
        accountService.signup(username, email, password)
        .then(usernameResult => {
            logger.debug(`signup done`);
            res.json(usernameResult);
        })
        .catch((e) => {
            logger.error(`signup error ${e}`);
            res.status(FORBIDDEN_STATUS).send({error:e});
        });
    });


    app.post("/account/signin", (req, res) => {
        const {username, password} = req.body;
        logger.info(`signin`);
        accountService.signin(username, password)
        .then(tokenResult => {
            logger.debug(`signin done`);
            res.json({
                jwt: tokenResult.token,
            });
        })
        .catch((e) => {
            logger.error(`signin error ${e}`);
            res.status(FORBIDDEN_STATUS).send({error:e});
        });
    });

    app.post("/account/addwebsite", (req, res) => {
        const {token, webSiteId} = req.body;
        logger.info(`addwebsite (webSiteId : ${webSiteId})`);
        if (webSiteId === undefined) {
            logger.debug(`addwebsite id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            addAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.debug(`addwebsite done`);
            })
            .catch((e) => {
                logger.error(`addwebsite error ${e}`)
                res.status(FORBIDDEN_STATUS).send({error:e});
            });
        }
    });

    app.post("/account/removewebsite", (req, res) => {
        const {token, webSiteId} = req.body;
        logger.info(`removewebsite`);
        if (webSiteId === undefined) {
            logger.error(`removewebsite error id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            removeAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.info(`removewebsite done`);
            })
            .catch((e) => {
                logger.error(`removewebsite error ${e}`);
                res.status(FORBIDDEN_STATUS).send({error:e});
            });
        }
    });

    app.post("/account/addmodel", (req, res) => {
        const {token, modelid} = req.body;
        logger.info(`addModel`);
        if (modelid === undefined) {
            logger.error(`addModel error id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Model, modelid);
            addAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.info(`addModel done`);
            })
            .catch((e) => {
                logger.error(`addModel error ${e}`);
            })
        }
    });

    app.post("/account/removemodel", (req, res) => {
        const {token, modelid} = req.body;
        logger.info(`removemodel`);
        if (modelid === undefined) {
            logger.error(`removemodel error id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Model, modelid);
            removeAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.info(`removemodel done`);
            })
            .catch((e) => {
                logger.error(`removemodel error ${e}`);
            })
        }
    });

    app.post("/account/addsession", (req, res) => {
        const {token, sessionid} = req.body;
        logger.info(`addsession`);
        if (sessionid === undefined) {
            logger.info(`addsession error id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Session, sessionid);
            addAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.info(`addsession done`);
            })
            .catch((e) => {
                logger.error(`addsession error ${e}`);
            })
        }
    });

    app.post("/account/removesession", (req, res) => {
        const {token, sessionid} = req.body;
        logger.info(`removesession`);
        if (sessionid === undefined) {
            logger.info(`removesession error id cannot be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Session, sessionid);
            removeAuthorization(accountService, res, token, authorization)
            .then(() => {
                logger.info(`removesession done`);
            })
            .catch((e) => {
                logger.error(`removesession error ${e}`);
            })
        }
    });


}

function addAuthorization(accountService : AccountService, res : Response, token : string, authorization : Authorization): Promise<void> {
    return accountService.addAuthorization(new Token(token), authorization)
    .then(tokenResult => {
        res.json({
            jwt: tokenResult.token,
        });
    })
}

function removeAuthorization(accountService : AccountService, res : Response, token : string, authorization : Authorization): Promise<void> {
    return accountService.removeAuthorization(new Token(token), authorization)
    .then(tokenResult => {
        res.json({
            jwt: tokenResult.token,
        });
    })
}
