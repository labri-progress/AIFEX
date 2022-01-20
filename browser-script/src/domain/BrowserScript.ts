import { logger } from "../framework/Logger";
import Action from "./Action";
import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import ClassMutationHandler from "./ClassMutationHandler";
import EventListener from "./EventListener";
import PageMutationHandler from "./PageMutationHandler";
import RuleService from "./RuleService";
import Token from "./Token";


export default class BrowserScript {

    private _serverURL: string;
	private _sessionId: string;
	private _webSiteId: string | undefined;
	private _token: Token | undefined;
    private _ruleService : RuleService;
    private _eventListener : EventListener;
    private _aifexService : AifexService;
    private _browserService : BrowserService;
    private _pageMutationHandler : PageMutationHandler;
    private _classMutationHandler : ClassMutationHandler | undefined;
    private _explorationNumber: number | undefined;

    
    constructor(serverURL: string, sessionId: string, token: Token | undefined, aifexService: AifexService, browserService: BrowserService) {
        this._serverURL = serverURL;
        this._sessionId = sessionId;
        this._token = token;
        this._aifexService = aifexService;
        this._browserService = browserService;
        this._ruleService = new RuleService();
        this._eventListener = new EventListener(this._ruleService);
        this._eventListener.addObserver(this.processNewAction.bind(this));

        this._pageMutationHandler = new PageMutationHandler(this.onMutation.bind(this));
        this._pageMutationHandler.init();
    }

    start() : Promise<void> {
        return this._aifexService.getSession(this._serverURL, this._sessionId, undefined)
            .then((sessionResult) => {
                if (sessionResult && sessionResult !== "Unauthorized") {
                    this._webSiteId = sessionResult.webSiteId;
                    this._aifexService.getWebSite(this._serverURL, this._webSiteId, undefined)
                        .then((webSiteResult) => {
                            if (webSiteResult && webSiteResult !== 'Unauthorized') {
                                const rules = webSiteResult.mappingList.map((ru : any) => this._ruleService.createRule(ru));
                                this._ruleService.loadRules(rules);

                                if (this._ruleService.getEventsToHandle().includes("css-class-added")) {
                                    if (this._classMutationHandler === undefined) {
                                        this._classMutationHandler = new ClassMutationHandler();
                                    }
                                }
                                
                                this._ruleService.mapRulesToElements();
                                logger.debug(`Rules loaded : ${rules.length}`);
                                this._eventListener.start();
                            }
                        })
                        .then(() => {
                            const currentExplorationNumber = this._browserService.getExplorationNumber();
                            if (currentExplorationNumber !== undefined) {
                                this._explorationNumber = currentExplorationNumber;
                            } else {
                                this._aifexService.createEmptyExploration("BROWSER_SCRIPT", this._serverURL, this._sessionId)
                                .then((explorationNumber) => {
                                    this._explorationNumber = explorationNumber;
                                    this._browserService.saveExplorationNumber(this._explorationNumber);
                                })
                                .then(() => {
                                    this.processNewAction(new Action("start", undefined));
                                })
                            }
                        })
                }
            })
    }

    processNewAction(action: Action): void {
        if (this._explorationNumber === undefined) {
            throw new Error("The exploration has not been correctly started")
        }
        this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId);
    }

    private onMutation() :void{
        this._ruleService.mapRulesToElements();
    }

}