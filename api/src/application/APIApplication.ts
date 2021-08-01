import Session, { SessionOverlayType } from "../domain/Session";
import AccountService from "../domain/AccountService";
import Mapping from "../domain/Mapping";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import Account from "../domain/Account";
import Screenshot from "../domain/Screenshot";
import { Kind } from "../domain/Kind";

export default class APIApplication {
    private _accountService: AccountService;
    private _webSiteService: WebSiteService;
    private _sessionService: SessionService;

    constructor(accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService) {
        this._accountService = accountService;
        this._webSiteService = webSiteService;
        this._sessionService = sessionService;
    }

    signup(username: string, email: string, password: string) : Promise<"UserNameAlreadyTaken" | "AccountCreated"> {
        return this._accountService.signup(username, email, password);
    }

    signin(username : string, password : string) : Promise<Token | "Unauthorized"> {
        return this._accountService.signin(username, password);
    }

    getAccount(token: Token) : Promise<Account | "Unauthorized"> {
        return this._accountService.getAccount(token);
    }

    findWebSiteById(token : Token, webSiteId : string ) : Promise<WebSite | undefined | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    "Unauthorized";
                } else {
                    const account : Account = result;
                    const authorized = account.authorizationSet.some((authorization)=>authorization.key === webSiteId && authorization.kind === Kind.WebSite);
                    if (! authorized) {
                        return "Unauthorized";
                    } else {
                        return this._webSiteService.findWebSiteById(webSiteId).then((result)=> result);
                    }
                }
            });
    }

    createWebSite(token: Token, name: string, url: string, mappingList : Mapping[] ) : Promise<Token | "Unauthorized"> {
        return this._webSiteService.createWebSite(name, url, mappingList)
            .then((webSiteId) => {
                return this._accountService.addWebSite(token, webSiteId);
            });
    }

    findSessionById(token : Token, sessionId : string ) : Promise<Session | undefined | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    "Unauthorized";
                } else {
                    const account : Account = result;
                    const authorized = account.authorizationSet.some((authorization)=>authorization.key === sessionId && authorization.kind === Kind.Session);
                    if (! authorized) {
                        return "Unauthorized";
                    } else {
                        return this._sessionService.findSessionById(sessionId).then((result)=> result);
                    }
                }
            });
    }

    createSession(token: Token, webSiteId: string, baseURL: string, name: string, overlayType: SessionOverlayType) : Promise<Token | "Unauthorized"> {
        return this._sessionService.createSession(webSiteId, baseURL, name, overlayType)
            .then((sessionId) => {
                return this._accountService.addSession(token, sessionId);
            });
    }

    /*addScreenshots(token: Token, screenshots: Screenshot[]) : Promise<"Unauthorized" | "ScreenshotsAdded"> {
        return this._sessionService.addScreenshots(screenshots);
    }*/

}