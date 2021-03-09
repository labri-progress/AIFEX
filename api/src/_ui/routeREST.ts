
import AccountService from "../domain/AccountService";
import Token from "../domain/Token";
import WebSiteService from "../domain/WebSiteService";

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app, accountService: AccountService, webSiteService: WebSiteService) {

    app.get("/account/ping", (req, res) => {
        res.send('alive');
    });

    app.post("/account/signup", (req, res) => {
        const { username, password } = req.body;
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
                req.session.jwt = tokenResult.token;
                req.session.username = username;
                console.log("Setting session with", req.session)
                res.sendStatus(200)
            })
            .catch((e) => {
                console.error("error:",e);
                res.status(403).send({error:e});
            });
    });

    app.post("/website/create", (req, res) => {
        const { name, url, mappingList } = req.body;
        console.log("Session is ", req.session)
        if (req.session.jwt === undefined) {
            return res.status(FORBIDDEN_STATUS).send({ error: "identification token required"})
        }

        const token = new Token(req.session.jwt)
        webSiteService.createWebSite(name, url, mappingList)
            .then(webSiteId => 
                accountService.addWebSite(token, webSiteId))
            .then(() => {
                res.sendStatus(200)
            })
            .catch(error => {
                res.status(error.status).send(error);
            })
    });

    app.post("/website/remove", (req, res) => {
        const { webSiteId } = req.body;
    
        const token = new Token(req.session.jwt)
        accountService.removeWebSite(token, webSiteId)
            .then(() => {
                res.sendStatus(200)
            })
            .catch(error => {
                res.status(error.status).send(error);
            })
      
    });

    app.get("/website/list/", (req, res) => {
        const tokenString = req.session.jwt
        if (tokenString === undefined) {
            return res.status(FORBIDDEN_STATUS).send({ error: "identification token required"})
        }
        const token = new Token(tokenString);
        const webSiteIdList = token.getWebsiteIdListFromToken();
        const getPromises = webSiteIdList.map(id => {
            return webSiteService.getWebSiteById(id)
        })
        return Promise.all(getPromises).then((webSiteList) => {
            console.log(webSiteList)
            return res.status(200).json(webSiteList)
        })
    });

  


}
