import { logger } from "../framework/Logger";
import Action from "./Action";
import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import EventListener from "./EventListener";
import Token from "./Token";


export default class BrowserScript {

    private _serverURL: string;
	private _sessionId: string;
	private _webSiteId: string | undefined;
	private _token: Token | undefined;
    private _eventListener : EventListener | undefined;
    private _aifexService : AifexService;
    private _browserService : BrowserService;
    private _explorationNumber: number | undefined;

    
    constructor(serverURL: string, sessionId: string, token: Token | undefined, aifexService: AifexService, browserService: BrowserService) {
        this._serverURL = serverURL;
        this._sessionId = sessionId;
        this._token = token;
        this._aifexService = aifexService;
        this._browserService = browserService;
    }

    start() : Promise<void> {
        return this._aifexService.getSession(this._serverURL, this._sessionId, undefined)
            .then((sessionResult) => {
                if (sessionResult && sessionResult !== "Unauthorized") {
                    this._webSiteId = sessionResult.webSiteId;
                    
                    const currentExplorationNumber = this._browserService.getExplorationNumber();
                    if (currentExplorationNumber !== undefined) {
                        this._explorationNumber = currentExplorationNumber;
                        this._eventListener = new EventListener(this._aifexService, this._explorationNumber, this._serverURL, this._sessionId);
                        this._eventListener.listen();
                    } else {
                        this._aifexService.createEmptyExploration("BROWSER_SCRIPT", this._serverURL, this._sessionId)
                        .then((explorationNumber) => {
                            this._explorationNumber = explorationNumber;
                            this._browserService.saveExplorationNumber(this._explorationNumber);
                            this._aifexService.sendAction(this._explorationNumber, new Action("start", undefined), this._serverURL, this._sessionId);
                            this._eventListener = new EventListener(this._aifexService, this._explorationNumber, this._serverURL, this._sessionId);
                            this._eventListener.listen();
                        })
                    }
                }
            })
    }

}