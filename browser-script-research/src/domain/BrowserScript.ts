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
    private _interactionIndex: number | undefined;

    
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
                    const interactionIndex = this._browserService.getInteractionIndex();
                    if (currentExplorationNumber !== undefined && interactionIndex !== undefined) {
                        logger.info("Exploration number is already set to " + currentExplorationNumber);
                        logger.info("Interaction index is already set to " + interactionIndex);
                        this._explorationNumber = currentExplorationNumber;
                        this._interactionIndex = interactionIndex;
                        this._eventListener = new EventListener(this._aifexService, this._browserService, this._explorationNumber, this._interactionIndex, this._serverURL, this._sessionId);
                        this._eventListener.listen();
                    } else {
                        this._aifexService.createEmptyExploration("BROWSER_SCRIPT", this._serverURL, this._sessionId)
                            .then((explorationNumber) => {
                                logger.info("New exploration,  number is " + explorationNumber);
                                this._explorationNumber = explorationNumber;
                                this._browserService.saveExplorationNumber(this._explorationNumber);
                                this._aifexService.sendAction(this._explorationNumber, new Action("start", undefined), this._serverURL, this._sessionId);
                                this._interactionIndex = 0;
                                this._browserService.saveInteractionIndex(this._interactionIndex);
                                this._eventListener = new EventListener(this._aifexService, this._browserService, this._explorationNumber, this._interactionIndex, this._serverURL, this._sessionId);
                                this._eventListener.listen();
                            })
                    }
                }
            })
    }

}