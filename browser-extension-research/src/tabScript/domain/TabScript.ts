import Action from "../domain/Action";
import BackgroundService from "./BackgroundService";
import EventListener from "./EventListener";
import State from "./State";

export default class TabScript {

    private _backgroundService : BackgroundService;
    private _eventListener : EventListener;
    
    constructor(backgroundService : BackgroundService) {
        this._backgroundService = backgroundService;
        this._eventListener = new EventListener(this._backgroundService);
    }

    synchronizeWithBackground() : Promise<void> {
        return this._backgroundService.getState()
        .then(state => {
            if (state.isActive) {
                this.explorationStarted();
            }
        })
    }

    getState() : Promise<State> {
        return this._backgroundService.getState();
    }

    explorationStarted() : void {
        this._eventListener.explorationStarted();
    }

    explorationStopped() : void {
        this._eventListener.explorationStopped();
    }

}