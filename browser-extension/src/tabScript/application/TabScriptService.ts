
import Interface4Background from "./Interface4Background";
import BackgroundService from "../domain/BackgroundService";
import TabScript from "../domain/TabScript";
import Comment from "../domain/Comment";
import State from "../domain/State";
import RuleService from "../domain/RuleService";
import Interface4ViewManager from "./Interface4UserView";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import Question from "../domain/Question";
import Action from "../domain/Action";
import {logger} from "../framework/Logger";
import ViewManagerService from "../domain/ViewManagerService";

export default class TabScriptService implements Interface4Background, Interface4ViewManager {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService) {
        this._tabScript = new TabScript(backgroundService);
    }

    setViewManager(viewManager : ViewManagerService) {
        this._tabScript.setViewManager(viewManager);
    }

    synchronizeWithBackground() : Promise<void> {
        logger.info(`tabscript will synchronize with Background`);
        return this._tabScript.synchronizeWithBackground();
    }

    getRuleService() : RuleService {
        logger.info(`getRuleService`);
        return this._tabScript.getRuleService();
    }

    explorationStarted() :void{
        logger.info(`exploration started`);
        this._tabScript.explorationStarted();
    }

    explorationStopped() :void{
        logger.info(`exploration stopped`);
        this._tabScript.explorationStopped();
    }

    reload() :void{
        logger.info(`reload`);
        this._tabScript.reload();
    }

    toggleUserView(visible: boolean) :void{
        logger.info(`toggleUserView`);
        this._tabScript.toggleUserView(visible);
    }

    getState(): Promise<State> {
        logger.info(`getState`);
        return this._tabScript.getState();
    }

    getActionList(): Action[] {
        logger.info(`getActionList`);
        return this._tabScript.getActionList();
    }

    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined> {
        logger.info(`getExplorationEvaluation`);
        return this._tabScript.getExplorationEvaluation();
    }

    commentConfirmed(comment: Comment): Promise<void> {
        logger.info(`comment is confirmed`);
        return this._tabScript.commentConfirmed(comment);
    }

    setUserViewPosition(newPosition : {x : number, y: number}) :void{
        logger.info(`setUserViewPosition`);
        this._tabScript.setUserViewPosition(newPosition);
    }

    pushAnswer(question: Question, value: boolean) :void{
        logger.info(`pushAnswer`);
        this._tabScript.pushAnswer(question, value);
    }

}