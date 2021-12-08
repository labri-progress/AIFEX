import EventListener from "./EventListener";
import RuleService from "./RuleService";


export default class TabScript {

    private _ruleService : RuleService;
    private _eventListener : EventListener;
    
    constructor() {
        this._ruleService = new RuleService();

        this._eventListener = new EventListener(this._ruleService);

        this._eventListener.explorationStarted();

    }

}