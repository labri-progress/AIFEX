import Action from "../domain/Action";
import BackgroundService from "./BackgroundService";
import EventListener from "./EventListener";
import ExplorationEvaluation from "./ExplorationEvaluation";
import PageMutationHandler from "./PageMutationHandler";
import RuleService from "./RuleService";
import State from "./State";
import ActionsAndElements from "./ActionsAndElements";
import Highlighter from "./Highlighter";

export default class TabScript {

    private _backgroundService : BackgroundService;
    private _ruleService : RuleService;
    private _eventListener : EventListener;
    private _highlighter : Highlighter;
    private _pageMutationHandler : PageMutationHandler;
    private _actionsAndElements : ActionsAndElements | undefined;
    
    constructor(backgroundService : BackgroundService, highlighter: Highlighter) {
        this._backgroundService = backgroundService;
        this._ruleService = new RuleService();

        this._eventListener = new EventListener(this._ruleService, this._backgroundService);
        this._eventListener.onNewUserAction(this.onNewUserAction.bind(this));

        this._pageMutationHandler = new PageMutationHandler(this.onMutation.bind(this));
        this._pageMutationHandler.init();
        this._highlighter = highlighter;
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

    refresh(): Promise<void> {
        if (this._highlighter == undefined) {
            return Promise.resolve();
        } 
        return this._backgroundService.getState()
        .then((state: State) => {
            if (!state.isActive) {
                return this._highlighter.hide()
            } else  {
                return Promise.all([
                    this.fetchActionsAndElements(),
                    this.getExplorationEvaluation()
                ]).then(([actionsAndElements, evaluation]) => {
                    this._actionsAndElements = actionsAndElements;
                    return this._highlighter.refresh(this._ruleService.elementListMatchedByRule, this._ruleService.elementRules, actionsAndElements, evaluation);
                })
            }
        });
    }

    getState() : Promise<State> {
        return this._backgroundService.getState();
    }

    public fetchActionsAndElements(): Promise<ActionsAndElements> {
        return this._backgroundService.getActionList()
        .then((actionList) => {
            const elementToActionMap = new Map<HTMLElement|SVGElement, Action[]>();
            for (const action of actionList) {
                action.ruleList = this._ruleService.getRuleListByAction(action);
                action.htmlElementList = this._ruleService.getHTMLElementsMatchedByAction(action);

                for (const element of action.htmlElementList) {
                    let actions = elementToActionMap.get(element);
                    if (!actions)  {
                        actions = [action];
                        elementToActionMap.set(element, actions);
                    }
                    else {
                        actions.push(action);
                    }
                }
            }
            return new ActionsAndElements(actionList, elementToActionMap)
        });
    }

    getActionList(): Action[] {
        if (this._actionsAndElements) {
            return this._actionsAndElements.actionList;
        } else {
            return [];
        }
    }

    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined> {
        return this._backgroundService.getExplorationEvaluation()
        .then((evaluation) => {
            if (evaluation) {    
                for (const action of evaluation.nextActionList) {
                    action.ruleList = this._ruleService.getRuleListByAction(action)
                    action.htmlElementList = this._ruleService.getHTMLElementsMatchedByAction(action);
                }
            }
            return evaluation;
        });
    }

    explorationStarted() : Promise<void> {
        this._eventListener.explorationStarted();
        return this.refresh()
    }

    explorationStopped() : void {
        this._eventListener.explorationStopped();
        this.refresh();
    }

    reload() : Promise<void> {
        return this._backgroundService.getState()
            .then(state => {
                const rules = state.webSite.mappingList.map((ru : any) => this._ruleService.createRule(ru));
                this._ruleService.loadRules(rules);
                this._ruleService.mapRulesToElements();
            })
    }

    private onMutation() :void{
        this._ruleService.mapRulesToElements();
        this.refresh();
    }

    private onNewUserAction() :void{
        this.refresh();
    }

}