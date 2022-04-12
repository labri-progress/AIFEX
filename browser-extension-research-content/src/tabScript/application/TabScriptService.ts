
import Interface4Background from "./Interface4Background";
import BackgroundService from "../domain/BackgroundService";
import TabScript from "../domain/TabScript";

export default class TabScriptService implements Interface4Background {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService) {
        this._tabScript = new TabScript(backgroundService);
    }

    synchronizeWithBackground() : Promise<void> {
        console.log(`tabscript will synchronize with Background`);
        return this._tabScript.synchronizeWithBackground();
    }

    explorationStarted() :void{
        console.log(`exploration started`);
        this._tabScript.explorationStarted();
    }

    explorationStopped() :void{
        console.log(`exploration stopped`);
        this._tabScript.explorationStopped();
    }

}