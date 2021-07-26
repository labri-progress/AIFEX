import Session, { SessionOverlayType } from "../domain/Session";
import AccountService from "../domain/AccountService";
import Mapping from "../domain/Mapping";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";

export default class APIApplication {
    private _accountService: AccountService;
    private _webSiteService: WebSiteService;
    private _sessionService: SessionService;

    constructor(accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService) {
        this._accountService = accountService;
        this._webSiteService = webSiteService;
        this._sessionService = sessionService;
    }

    signin(username : string, password : string) : Promise<Token | "Unauthorized"> {
        return this._accountService.signin(username, password);
    }

    findWebSiteById(token : Token, webSiteId : string ) : Promise<WebSite | "Unauthorized"> {
        return this._webSiteService.findWebSiteById(token, webSiteId);
    }

    findWebSiteIds(token: Token) : Promise<string[] | "Unauthorized"> {
        return this._webSiteService.findWebSiteIds(token);
    }

    createWebSite(token: Token, name: string, url: string, mappingList : Mapping[] ) : Promise<Token | "Unauthorized"> {
        return this._webSiteService.createWebSite(token, name, url, mappingList)
            .then((webSiteId) => {
                return this._accountService.addWebSite(token, webSiteId);
            });
    }

    findSessionById(token : Token, sessionId : string ) : Promise<Session | "Unauthorized"> {
        return this._sessionService.findSessionById(token, sessionId);
    }

    findSessionIds(token: Token) : Promise<string[] | "Unauthorized"> {
        return this._sessionService.findSessionIds(token);
    }

    createSession(token: Token, webSiteId: string, baseURL: string, name: string, overlayType: SessionOverlayType) : Promise<Token | "Unauthorized"> {
        return this._sessionService.createSession(token, webSiteId, baseURL, name, overlayType)
            .then((sessionId) => {
                return this._accountService.addSession(token, sessionId);
            });
    }

}