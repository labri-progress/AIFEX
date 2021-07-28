import AccountService from "../application/AccountService";
import Token from "../domain/Token";
import Authorization from "../domain/Authorization";
import { Kind } from "../domain/Kind";
import e, { Response, Express } from "express";
import { logger } from "../logger";

const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Express, accountService: AccountService) {
    app.get("/account/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.post("/account/signup", (req, res) => {
        let { username, email, password } = req.body;
        if (email === undefined) {
            email = "nomail";
        }
        logger.info(`signup`);
        accountService.signup(username, email, password)
            .then((result) => {
                if (result === "UserNameAlreadyTaken") {
                    logger.debug(`signup failed, username already taken`);
                    res.status(INVALID_PARAMETERS_STATUS).json(result);
                } else {
                    logger.debug(`signup done`);
                    res.json(result);
                }
            })
            .catch((e) => {
                logger.error(`signup error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
            });
    });


    app.post("/account/signin", (req, res) => {
        const { username, password } = req.body;
        logger.info(`signin`);
        accountService.signin(username, password)
            .then((result) => {
                if (result === "IncorrectUsernameOrPassword") {
                    res.status(UNAUTHORIZED_STATUS).json(result);
                } else {
                    logger.debug(`signin done`);
                    res.json({
                        jwt: result.token,
                    });
                }
            })
            .catch((e) => {
                logger.error(`signin error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
            });
    });

    app.get("/account/account", (req, res) => {
        const { token } = req.body;
        logger.info(`get account`);
        if (token === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token is missing" });
        } else {
            accountService.getUsernameAndAuthorizationSet(token)
                .then((result) => {
                    if (result === "InvalidToken") {
                        res.status(UNAUTHORIZED_STATUS).json(result);
                    } else {
                        res.json(result);
                    }
                })
        }
    });

    app.post("/account/addwebsite", (req, res) => {
        const { token, webSiteId } = req.body;
        logger.info(`addwebsite, webSiteId : ${webSiteId})`);
        if (token === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token or webSiteIf are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            addAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.debug(`addwebsite done`);
                })
                .catch((e) => {
                    logger.error(`addwebsite error ${e}`)
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                });
        }
    });

    app.post("/account/removewebsite", (req, res) => {
        const { token, webSiteId } = req.body;
        logger.info(`removewebsite, webSiteId ${webSiteId}`);
        if (token === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token of webSiteId are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            removeAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.info(`removewebsite done`);
                })
                .catch((e) => {
                    logger.error(`removewebsite error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                });
        }
    });

    app.post("/account/addmodel", (req, res) => {
        const { token, modelId } = req.body;
        logger.info(`addModel,  modelId (${modelId}`);
        if (token === undefined || modelId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token or modelId are missing" });
        } else {
            const authorization = new Authorization(Kind.Model, modelId);
            addAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.info(`addModel done`);
                })
                .catch((e) => {
                    logger.error(`addModel error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/removemodel", (req, res) => {
        const { token, modelId } = req.body;
        logger.info(`removemodel`);
        if (token === undefined || modelId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token or modelId are missing" });
        } else {
            const authorization = new Authorization(Kind.Model, modelId);
            removeAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.info(`removemodel done`);
                })
                .catch((e) => {
                    logger.error(`removemodel error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/addsession", (req, res) => {
        const { token, sessionId } = req.body;
        logger.info(`addsession`);
        if (token === undefined || sessionId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token or sessionId are missing" });
        } else {
            const authorization = new Authorization(Kind.Session, sessionId);
            addAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.info(`addsession done`);
                })
                .catch((e) => {
                    logger.error(`addsession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/removesession", (req, res) => {
        const { token, sessionId } = req.body;
        logger.info(`removesession`);
        if (token === undefined || sessionId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or sessionId are missing" });
        } else {
            const authorization = new Authorization(Kind.Session, sessionId);
            removeAuthorization(accountService, res, new Token(token), authorization)
                .then(() => {
                    logger.info(`removesession done`);
                })
                .catch((e) => {
                    logger.error(`removesession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/verifyauthorization", (req, res) => {
        const { token, kind, id } = req.body;
        logger.info(`verify authorization`);
        if (token === undefined || kind === undefined || id === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token or kind or id are missing" });
        } else {
            accountService.verifyAuthorization(new Token(token), kind, id)
                .then((verification) => {
                    logger.info(`verification done`);
                    res.json({authorized:verification});
                })
                .catch((e) => {
                    logger.error(`verification error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });
}

function addAuthorization(accountService: AccountService, res: Response, token: Token, authorization: Authorization): Promise<void> {
    return accountService.addAuthorization(token, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                res.status(NOT_FOUND_STATUS).json(result);
            } else {
                res.json({
                    message: "AuthorizationAdded",
                });
            }
        })
}

function removeAuthorization(accountService: AccountService, res: Response, token: Token, authorization: Authorization): Promise<void> {
    return accountService.removeAuthorization(token, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                res.status(NOT_FOUND_STATUS).json(result);
            } else {
                res.json({
                    message: "AuthorizationAdded",
                });
            }
        })
}
