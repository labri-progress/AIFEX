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
                    logger.debug(`signup user name already taken`);
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

    app.post("/account/addwebsite", (req, res) => {
        const { username, webSiteId } = req.body;
        logger.info(`addwebsite, username (${username}), webSiteId : ${webSiteId})`);
        if (username === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or webSiteIf are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            addAuthorization(accountService, res, username, authorization)
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
        const { username, webSiteId } = req.body;
        logger.info(`removewebsite, username (${username}), webSiteId ${webSiteId}`);
        if (username === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username of webSiteId are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            removeAuthorization(accountService, res, username, authorization)
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
        const { username, modelId } = req.body;
        logger.info(`addModel, username (${username}), modelId (${modelId}`);
        if (username === undefined || modelId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or modelId are missing" });
        } else {
            const authorization = new Authorization(Kind.Model, modelId);
            addAuthorization(accountService, res, username, authorization)
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
        const { username, modelId } = req.body;
        logger.info(`removemodel`);
        if (username === undefined || modelId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or modelId are missing" });
        } else {
            const authorization = new Authorization(Kind.Model, modelId);
            removeAuthorization(accountService, res, username, authorization)
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
        const { username, sessionId } = req.body;
        logger.info(`addsession`);
        if (username === undefined || sessionId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or sessionId are missing" });
        } else {
            const authorization = new Authorization(Kind.Session, sessionId);
            addAuthorization(accountService, res, username, authorization)
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
        const { username, sessionId } = req.body;
        logger.info(`removesession`);
        if (username === undefined || sessionId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or sessionId are missing" });
        } else {
            const authorization = new Authorization(Kind.Session, sessionId);
            removeAuthorization(accountService, res, username, authorization)
                .then(() => {
                    logger.info(`removesession done`);
                })
                .catch((e) => {
                    logger.error(`removesession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });
}

function addAuthorization(accountService: AccountService, res: Response, username: string, authorization: Authorization): Promise<void> {
    return accountService.addAuthorization(username, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                res.status(NOT_FOUND_STATUS).json(result);
            } else {
                res.json({
                    jwt: result.token,
                });
            }
        })
}

function removeAuthorization(accountService: AccountService, res: Response, username: string, authorization: Authorization): Promise<void> {
    return accountService.removeAuthorization(username, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                res.status(NOT_FOUND_STATUS).json(result);
            } else {
                res.json({
                    jwt: result.token,
                });
            }
        })
}
