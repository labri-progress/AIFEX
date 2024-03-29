import AccountService from "../application/AccountService";
import Token from "../domain/Token";
import Authorization from "../domain/Authorization";
import { Kind } from "../domain/Kind";
import { Response, Express } from "express";
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
        logger.info(`signup for ${username}`);
        accountService.signup(username, email, password)
            .then((result) => {
                if (result === "UserNameAlreadyTaken") {
                    logger.debug(`signup failed, username already taken`);
                    res.status(INVALID_PARAMETERS_STATUS).json({message:result});
                } else {
                    logger.debug(`signup done`);
                    res.json({message:result});
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

    app.post("/account/account", (req, res) => {
        const { token } = req.body;
        logger.info(`get account`);
        logger.debug(`token :${JSON.stringify(token)}`);
        if (token === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token is missing" });
        } else {
            accountService.getAccount(new Token(token))
                .then((result) => {
                    if (result === "InvalidToken") {
                        logger.debug(`invalidToken`);
                        res.status(UNAUTHORIZED_STATUS).json({message:result});
                    } else {
                        logger.debug(`return account`);
                        logger.debug(`account: ${JSON.stringify(result)}`);;
                        res.json(result);
                    }
                })
        }
    });

    app.post("/account/addwebsite", (req, res) => {
        const { username, webSiteId } = req.body;
        logger.info(`addwebsite, webSiteId : ${webSiteId})`);
        if (username === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or webSiteIf are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            logger.info(`addwebsite, webSiteId : ${webSiteId})`);

            addAuthorization(accountService, res, username, authorization)
                .catch((e) => {
                    logger.error(`addwebsite error ${e}`)
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                });
        }
    });

    app.post("/account/removewebsite", (req, res) => {
        const { username, webSiteId } = req.body;
        logger.info(`removewebsite, webSiteId ${webSiteId}`);
        if (username === undefined || webSiteId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username of webSiteId are missing" });
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            removeAuthorization(accountService, res, username, authorization)
                .catch((e) => {
                    logger.error(`removewebsite error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                });
        }
    });

    app.post("/account/addmodel", (req, res) => {
        const { username, modelId } = req.body;
        logger.info(`addModel,  modelId (${modelId}`);
        if (username === undefined || modelId === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "username or modelId are missing" });
        } else {
            const authorization = new Authorization(Kind.Model, modelId);
            addAuthorization(accountService, res, username, authorization)
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
                .catch((e) => {
                    logger.error(`removesession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/addinvitation", (req, res) => {
        const { fromUsername, toUsername, kind, key } = req.body;
        logger.info(`add invitation`);
        if (fromUsername === undefined || toUsername === undefined || kind === undefined || key === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "fromUsername, toUsername, kind or key are missing" });
        } else {
            accountService.addInvitation(fromUsername, toUsername, key, kind)
                .then((result) => {
                    if (result === "InvitationIsAdded") {
                        res.json({message: result});
                    } else {
                        res.status(INVALID_PARAMETERS_STATUS).send({ error: "fromUsername or toUsername is not valid" });
                    }
                })
                .catch((e) => {
                    logger.error(`removesession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });


    app.post("/account/removeinvitation", (req, res) => {
        const { fromUsername, toUsername, kind, key } = req.body;
        logger.info(`remove invitation`);
        if (fromUsername === undefined || toUsername === undefined || kind === undefined || key === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "fromUsername, toUsername, kind or key are missing" });
        } else {
            accountService.removeInvitation(fromUsername, toUsername, key, kind)
                .then((result) => {
                    if (result === "InvitationIsRemoved") {
                        res.json({message: result});
                    } else {
                        res.status(INVALID_PARAMETERS_STATUS).send({ error: "fromUsername or toUsername is not valid" });
                    }
                })
                .catch((e) => {
                    logger.error(`removesession error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/verify", (req, res) => {
        const { token } = req.body;
        logger.info(`verify token`);
        if (token === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "token is missing" });
        } else {
            if (accountService.verify(new Token(token))) {
                logger.info(`verification done ok`);
                res.json({verification:true});
            } else {
                logger.info(`verification done nok`);
                res.status(UNAUTHORIZED_STATUS).json({verification:false});
            }
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

    app.post("/account/makeauthorizationpublic", (req, res) => {
        const { kind, key} = req.body;
        logger.info(`make authorization public`);
        if (kind === undefined || key === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "kind or key are missing" });
        } else {
            accountService.makeAuthorizationPublic(kind, key)
                .then((result) => {
                    logger.info("authorization is now public");
                    res.json({message:result});
                })
                .catch((e) => {
                    logger.error(`make authorization public error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                }
            )
        }
    });

    app.post("/account/revokepublicauthorization", (req, res) => {
        const { kind, key} = req.body;
        logger.info(`revoke public authorization`);
        if (kind === undefined || key === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "kind or key are missing" });
        } else {
            accountService.revokePublicAuthorization(kind, key)
                .then((result) => {
                    logger.info("authorization is now private");
                    res.json({message:result});
                })
                .catch((e) => {
                    logger.error(`revoke public authorization error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

    app.post("/account/isauthorizationpublic", (req, res) => {
        const { kind, key} = req.body;
        logger.info(`is authorization public`);
        if (kind === undefined || key === undefined) {
            logger.debug(`missing parameters`);
            res.status(INVALID_PARAMETERS_STATUS).send({ error: "kind or key are missing" });
        } else {
            accountService.isAuthorizationPublic(kind, key)
                .then((result) => {
                    logger.info("is authorization public ? : "+result);
                    res.json({isPublic:result});
                })
                .catch((e) => {
                    logger.error(`is authorization public error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
                })
        }
    });

}   

function addAuthorization(accountService: AccountService, res: Response, username: string, authorization: Authorization): Promise<void> {
    return accountService.addAuthorization(username, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                logger.debug('addAuthorization incorrect username');
                res.status(NOT_FOUND_STATUS).json({message:result});
            } else {
                logger.debug('addAuthorization: '+result);
                res.json({
                    message: result,
                });
            }
        }).catch(e => {
            logger.error(`Failed to create authorization ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({ error: e });
        })
}

function removeAuthorization(accountService: AccountService, res: Response, username: string, authorization: Authorization): Promise<void> {
    return accountService.removeAuthorization(username, authorization)
        .then((result) => {
            if (result === "IncorrectUsername") {
                logger.debug('remove authorization incorrect username');
                res.status(NOT_FOUND_STATUS).json({message:result});
            } else {
                logger.debug('remove authorization: '+result);
                res.json({
                    message: result,
                });
            }
        })
}
