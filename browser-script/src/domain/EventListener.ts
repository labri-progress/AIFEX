import RuleService from "./RuleService";
import Action from "./Action";
import { logger } from "../framework/Logger";

export default class EventListener {
    private _ruleService: RuleService;
    private _handledEvents: string[];
    private _newActionCallbacks: ((action: Action) => void)[];
    private _aifexService: AifexService;

    constructor(ruleService: RuleService, aifexService: AifexService) {
        this._ruleService = ruleService
        this._handledEvents = [];
        this._newActionCallbacks = [];
        this._aifexService = aifexService;
    }

    explorationStarted(): void {
        this.listen();
    }



    private listen(): void {
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
                        logger.info(`action : ${action.toString()}`);
                        this.aifexService.sendAction(action)
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

    public onNewUserAction(callback : (action : Action) => void): void {
        if (typeof callback === "function") {
            this._newActionCallbacks.push(callback)
        }
    }
}
