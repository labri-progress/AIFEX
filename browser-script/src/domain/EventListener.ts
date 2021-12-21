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

    start() {
        this._handledEvents = this._ruleService.getEventsToHandle();
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
                        logger.info(`action : ${action.toString()}`);
                        this._backgroundService.sendAction(action)
                            .then(() => {
                                this._newActionCallbacks.forEach(callback => callback(action));
                            })
                            .catch((error) => {
                                logger.error('Error while Listener pushed action ', error);
                            })
                    }
                }
            }
        }
    }

    
}
