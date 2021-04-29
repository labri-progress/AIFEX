
import AccountService from "../domain/AccountService";
import SessionService from "../domain/SessionService";
import WebSiteService from "../domain/WebSiteService";

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app, accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService) {

    app.get("/api/ping", (req, res) => {
        res.send('alive');
    });


    app.post("/api/signin", (req, res) => {
        const {username, password} = req.body;
        accountService.signin(username, password)
            .then(tokenResult => {
                if (tokenResult === "Unauthorized") {

                } else {
                    req.session.jwt = tokenResult.token;
                    req.session.username = username;
                    console.log("Setting session with", req.session.id)
                    res.json(tokenResult.token);
                }
            })
            .catch((e) => {
                console.error("error:",e);
                res.status(403).send({error:e});
            });
    });



}
