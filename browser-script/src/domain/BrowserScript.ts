import Action from "./Action";
import AifexService from "./AifexService";
import EventListener from "./EventListener";
import RuleService from "./RuleService";


export default class TabScript {

    private _ruleService : RuleService;
    private _eventListener : EventListener;
    private _aifexService: AifexService;
    
    constructor(aifexService: AifexService) {
        this._ruleService = new RuleService();
        this._aifexService = aifexService,
        this._eventListener = new EventListener(this._ruleService);
        this._eventListener.listen();
        this._eventListener.onNewUserAction(this.onNewAction.bind(this));
    }

    onNewAction(action: Action) {
        
    }

}