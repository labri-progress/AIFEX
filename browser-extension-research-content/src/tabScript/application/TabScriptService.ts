
import Interface4Background from "./Interface4Background";
import BackgroundService from "../domain/BackgroundService";
import TabScript from "../domain/TabScript";
import State from "../domain/State";
import Action from "../domain/Action";
import {logger} from "../framework/Logger";

export default class TabScriptService implements Interface4Background {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService) {
        this._tabScript = new TabScript(backgroundService);
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

}