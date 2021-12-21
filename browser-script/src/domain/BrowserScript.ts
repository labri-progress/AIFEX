import Action from "./Action";
import AifexService from "./AifexService";
import EventListener from "./EventListener";
import RuleService from "./RuleService";
import Token from "./Token";


export default class TabScript {

    private _serverURL: string | undefined;
	private _sessionId: string | undefined;
	private _webSiteId: string | undefined;
	private _token: Token | undefined;
    private _ruleService : RuleService | undefined;
    private _eventListener : EventListener | undefined;
    private _aifexService : AifexService | undefined;

    
    constructor(connectionURL: string, token: Token | undefined, aifexService: AifexService) {
        try {
			const CONNECTION_URL = new URL(connectionURL);
			let sessionId = CONNECTION_URL.searchParams.get('sessionId');
			if (sessionId) {
				this._sessionId = sessionId;
			}
			this._serverURL = CONNECTION_URL.origin;
			this._token = token;
            this._ruleService = new RuleService();
            this._eventListener = new EventListener(this._ruleService);
            this._aifexService = aifexService;
            
		} catch (e) {
			console.error('wrong connectionURL !!! Won\'t listen to any action');
		}
        
    }

    synchronizeWithBackground() : Promise<void> {
        return this._backgroundService.getState()
        .then(state => {
            const rules = state.webSite.mappingList.map((ru : any) => this._ruleService.createRule(ru));
            this._ruleService.loadRules(rules);
            this._ruleService.mapRulesToElements();
            if (state.isActive) {
                this.explorationStarted();
            } else {
                this._highlighter.hide();
            }
        })
    }

    processNewAction(prefix: string, suffix?: string): Promise<void> {
        if (this._isRecording && this._exploration) {
            this._exploration.addAction(prefix, suffix);
            this._commentsUp = [];

            const promises = [
                this.fetchComments(),
                this.evaluateExploration(),
                this.fetchProbabilityMap()
            ];

            if (this._recordActionByAction) {
                if (!this._serverURL ||  !this._sessionId) {
                    throw new Error("Not connected to a session")
                }
                if (this._exploration.explorationNumber === undefined) {
                    throw new Error("The exploration has not been correctly started")
                }
                const actionList = this._exploration.actions;
                const lastAction = actionList[actionList.length-1];
                const pushActionListPromise = this._aifexService.pushActionOrCommentList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [lastAction])

                promises.push(pushActionListPromise);
            }
            return Promise.all(promises)
                .then(() => {
                    this.refreshPopup();
                })

        } else {
            return Promise.resolve();
        }
    }

}