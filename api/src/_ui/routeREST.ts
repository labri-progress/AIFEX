import AccountService from "../application/AccountService";
import Token from "../domain/Token";
import Authorization from "../domain/Authorization";
import { Kind } from "../domain/Kind";

export default function attachRoutes(app, accountService: AccountService) {
    app.get("/account/ping", (req, res) => {
        res.send('alive');
    });

    app.post("/account/signup", (req, res) => {
        const {username, password} = req.body;
        accountService.signup(username, password)
            .then(usernameResult => {
                res.json(usernameResult);
            })
            .catch((e) => {
                console.error("error:",e);
                res.status(403).send({error:e});
            });
    });


    app.post("/account/signin", (req, res) => {
        const {username, password} = req.body;
        accountService.signin(username, password)
            .then(tokenResult => {
                res.json({
                    jwt: tokenResult.token,
                });
            })
            .catch((e) => {
                console.error("error:",e);
                res.status(403).send({error:e});
            });
    });

    app.post("/account/addwebsite", (req, res) => {
        const {token, webSiteId} = req.body;
        if (webSiteId === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            addAuthorization(accountService, res, token, authorization);
        }
    });

    app.post("/account/removewebsite", (req, res) => {
        const {token, webSiteId} = req.body;
        if (webSiteId === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.WebSite, webSiteId);
            removeAuthorization(accountService, res, token, authorization);
        }
    });

    app.post("/account/addmodel", (req, res) => {
        const {token, modelid} = req.body;
        if (modelid === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Model, modelid);
            addAuthorization(accountService, res, token, authorization);
        }
    });

    app.post("/account/removemodel", (req, res) => {
        const {token, modelid} = req.body;
        if (modelid === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Model, modelid);
            removeAuthorization(accountService, res, token, authorization);
        }
    });

    app.post("/account/addsession", (req, res) => {
        const {token, sessionid} = req.body;
        if (sessionid === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Session, sessionid);
            addAuthorization(accountService, res, token, authorization);
        }
    });

    app.post("/account/removesession", (req, res) => {
        const {token, sessionid} = req.body;
        if (sessionid === undefined) {
            res.status(412).send({error:"id cannot be undefined"});
        } else {
            const authorization = new Authorization(Kind.Session, sessionid);
            removeAuthorization(accountService, res, token, authorization);
        }
    });


}

function addAuthorization(accountService, res, token, authorization) {
    accountService.addAuthorization(new Token(token), authorization)
        .then(tokenResult => {
            res.json({
                jwt: tokenResult.token,
            });
        })
        .catch((e) => {
            console.error("error:",e);
            res.status(403).send({error:e});
        });
}

function removeAuthorization(accountService, res, token, authorization) {
    accountService.removeAuthorization(new Token(token), authorization)
        .then(tokenResult => {
            res.json({
                jwt: tokenResult.token,
            });
        })
        .catch((e) => {
            console.error("error:",e);
            res.status(403).send({error:e});
        });

}
