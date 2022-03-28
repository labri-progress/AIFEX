
import Interface4Background from "./Interface4Background";
import BackgroundService from "../domain/BackgroundService";
import TabScript from "../domain/TabScript";
import State from "../domain/State";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import Action from "../domain/Action";
import {logger} from "../framework/Logger";
import Highlighter from "../domain/Highlighter";

export default class TabScriptService implements Interface4Background {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService, highlighter: Highlighter) {
        this._tabScript = new TabScript(backgroundService, highlighter);
    }

    synchronizeWithBackground() : Promise<void> {
        logger.info(`tabscript will synchronize with Background`);
        return this._tabScript.synchronizeWithBackground();
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

}