import AccountService from "../domain/AccountService";
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
        return this._webSiteService.getWebSiteById(token, webSiteId);
    }

    getWebSitesIds(token : Token) : Promise<String[] | "Unauthorized"> {
        return this._webSiteService.getWebSiteIds(token);
    }



}