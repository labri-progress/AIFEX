import BackgroundService from "./BackgroundService";
import EventListener from "./EventListener";
import State from "./State";
import BrowserService from "./BrowserService";
import Highlighter from "./Highlighter";

export default class TabScript {

    private _backgroundService : BackgroundService;
    private _browserService : BrowserService;
    private _eventListener : EventListener;
    private _highlighter : Highlighter;
    
    constructor(backgroundService : BackgroundService, browserService : BrowserService) {
        this._backgroundService = backgroundService;
        this._browserService = browserService;
        this._eventListener = new EventListener(this._backgroundService, this._browserService);
        this._highlighter = new Highlighter(this._browserService);
    }

}