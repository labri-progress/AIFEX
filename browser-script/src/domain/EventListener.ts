import RuleService from "./RuleService";
import Action from "./Action";

export default class EventListener {
    private _ruleService: RuleService;
    private _handledEvents: string[];
    private _newActionCallbacks: ((action: Action) => void)[];

    constructor(ruleService: RuleService) {
        this._ruleService = ruleService
        this._handledEvents = [];
        this._newActionCallbacks = [];
    }
    
    public listen(): void {
        const events = this._ruleService.getEventsToHandle()
        this._handledEvents = events;

        this._handledEvents.forEach((handledEvent) => {
            document.addEventListener(handledEvent, this.exploratoryListener.bind(this), true)
        });
    }

    private exploratoryListener(event: Event): void {
        let unsafeEvent: any = event;
        if (unsafeEvent.isTrusted) {
            if (!unsafeEvent.explored) {
                unsafeEvent.explored = true;
                const rule = this._ruleService.getMatchingRule(event);
                if (rule) {
                    const action = rule.makeAction(event);
                    if (action) {
                        this._newActionCallbacks.forEach(callback => callback(action));
                    }
                }
            }
        }
    }

    public onNewUserAction(callback : (action : Action) => void): void {
        if (typeof callback === "function") {
            this._newActionCallbacks.push(callback)
        }
    }
}
