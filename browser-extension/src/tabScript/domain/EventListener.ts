import RuleService from "./RuleService";
import BackgroundService from "./BackgroundService"
import Action from "./Action";
import { logger } from "../framework/Logger";

export default class EventListener {
    private _ruleService: RuleService;
    private _handledEvents: string[];
    private _newActionCallbacks: ((action: Action) => void)[];
    private _backgroundService: BackgroundService;

    constructor(ruleService: RuleService, backgroundService: BackgroundService) {
        this._ruleService = ruleService
        this._handledEvents = [];
        this._newActionCallbacks = [];
        this._backgroundService = backgroundService;
    }

    explorationStarted(): void {
        this.listen();
    }

    explorationStopped(): void {
        this.unlisten();
    }

    reload(): void {
        this.unlisten();
        this.listen();
    }

    private listen(): void {
        const events = this._ruleService.getEventsToHandle()
        this._handledEvents = events;

        this._handledEvents.forEach((handledEvent) => {
            document.addEventListener(handledEvent, this.exploratoryListener.bind(this), true)
        });
    }

    private unlisten(): void {
        this._handledEvents.forEach((handledEvent) => {
            document.removeEventListener(handledEvent, this.exploratoryListener.bind(this), true)
        });
    }

    private exploratoryListener(event: Event): void {
        logger.info('exploratoryListener');
        let unsafeEvent: any = event;
        if (unsafeEvent.isTrusted) {
            if (!unsafeEvent.explored) {
                logger.info('event was unexplored');
                unsafeEvent.explored = true;
                const rule = this._ruleService.getMatchingRule(event);
                logger.info(`rule:${rule}`);
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

    public onNewUserAction(callback : (action : Action) => void): void {
        if (typeof callback === "function") {
            this._newActionCallbacks.push(callback)
        }
    }
}
