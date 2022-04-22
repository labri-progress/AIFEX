import BackgroundService from "./BackgroundService";
import BrowserService from "./BrowserService";
import EventListener from "./EventListener";
import State from "./State";

export default class TabScript {

    private _backgroundService : BackgroundService;
    private _browserService : BrowserService;
    private _eventListener : EventListener;
    
    constructor(backgroundService : BackgroundService, browserService : BrowserService) {
        this._backgroundService = backgroundService;
        this._browserService = browserService;
        this._eventListener = new EventListener(this._backgroundService);
    }

    synchronizeWithState() : Promise<void> {
        return this._browserService.getStateFromStorage().then((state : State) => {
            if (state.isRecording) {
                console.log("[TabScript] records event")
                this._eventListener.explorationStarted();
            } else {
                console.log("[TabScript] does not record event");
            }
        });
    }

}