
import BackgroundService from "../domain/BackgroundService";
import BrowserService from "../domain/BrowserService";
import TabScript from "../domain/TabScript";

export default class TabScriptService {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService, browserService : BrowserService) {
        this._tabScript = new TabScript(backgroundService, browserService);
    }

    synchronizeWithState() : Promise<void> {
        console.log(`tabscript will synchronize with Background`);
        return this._tabScript.synchronizeWithState();
    }

}