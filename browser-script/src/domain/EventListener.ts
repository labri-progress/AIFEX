import RuleService from "./RuleService";
import Action from "./Action";
import { logger } from "../framework/Logger";

export default class EventListener {
    private _ruleService: RuleService;
    private _handledEvents: string[];
    private _observers: ((action: Action) => void)[];

    constructor(ruleService: RuleService) {
        this._ruleService = ruleService
        this._handledEvents = [];
        this._observers = [];
    }

    start() {
        this._handledEvents = this._ruleService.getEventsToHandle();
        logger.debug(`EventListener: there are ${this._handledEvents.length} events to handle`);
        this._handledEvents.forEach((handledEvent) => {
            document.addEventListener(handledEvent, this.exploratoryListener.bind(this), true)
        });
    }

    addObserver(observerFunction : (action: Action) => void) {
        this._observers.push(observerFunction);
    }

    private exploratoryListener(event: Event): void {
        let unsafeEvent: any = event;
        if (unsafeEvent.isTrusted) {
            if (!unsafeEvent.explored) {
                unsafeEvent.explored = true;
                logger.debug(`EventListener: event ${unsafeEvent.type} is being handled`);
                const rule = this._ruleService.getMatchingRule(event);
                if (rule) {
                    const action = rule.makeAction(event);
                    if (action) {
                        logger.info(`action : ${action.toString()}`);
                        this._observers.forEach((observer) => {
                            observer(action);
                        });
                    } else {
                        logger.debug('no action');
                    }
                }
            }
        }
    }

}
