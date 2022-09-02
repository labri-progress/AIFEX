
import BackgroundService from "../domain/BackgroundService";
import TabScript from "../domain/TabScript";
import {logger} from "../framework/Logger";
import BrowserService from "../domain/BrowserService";

export default class TabScriptService {
    private _tabScript : TabScript;

    constructor(backgroundService : BackgroundService, browserService : BrowserService) {
        this._tabScript = new TabScript(backgroundService, browserService);
    }

}