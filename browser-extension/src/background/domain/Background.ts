import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import CompatibilityCheck from "./CompatibilityCheck";
import Screenshot from "./Screenshot";
import { PopupPageKind } from "./PopupPageKind";
import Action from "./Action";
import State from "./State";

export default class Background {

    private _aifexService: AifexService;
    private _browserService: BrowserService;

    constructor(aifexService: AifexService, browserService: BrowserService) {
        this._aifexService = aifexService;
        this._browserService = browserService;
    }


    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck> {
        return this._aifexService.getPluginInfo(serverURL)
            .then((pluginInfo) => {
                return new CompatibilityCheck(this._browserService.getExtensionVesion(), pluginInfo.version, pluginInfo.url);
            });
    }

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
        console.log("connect");
        return this._aifexService.getSession(serverURL, sessionId)
            .then((sessionResult) => {
                if (sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (sessionResult === undefined) {
                    return "NotFound";
                } else {
                    return this._browserService.getStateFromStorage()
                        .then((stateFromStorage) => {
                            let state = stateFromStorage || new State();
                            state.sessionBaseURL = sessionResult.baseURL;
                            state.sessionId = sessionId;
                            state.serverURL = serverURL;
                            state.sessionDescription = sessionResult.description;
                            state.connectedToSession = true;
                            state.popupPageKind = PopupPageKind.ReadSessionDescription;
                            return this._browserService.setStateToStorage(state)
                                .then(() => {
                                    return "Connected";
                                })
                        })
                }
            })
    }

    

    startExploration() : Promise<void> {
        console.log('startExploration');
        return this._browserService.getStateFromStorage()
            .then((state) => {
                if (state == undefined || state.serverURL === undefined || state.sessionId === undefined) {
                    throw new Error("Not connected to a session")
                }
                if (state.isRecording) {
                    console.log('Connected and recording');
                    return Promise.resolve();
                }
                console.log('will create an empty exploration for testerName: ' + state.testerName);
                return this._aifexService.createEmptyExploration(state.serverURL, state.sessionId, state.testerName || "anonymous")
                    .then(explorationNumber => {
                        state.explorationNumber = explorationNumber;
                        state.explorationLength = 0;
                        state.isRecording = true;
                        return this._browserService.setStateToStorage(state);
                    })
                    .then(() => {
                        console.log('exploration created');
                        return this.processNewAction("start");
                    })
            })  
    }
    

    processNewAction(prefix: string, suffix?: string): Promise<void> {
        return this._browserService.getStateFromStorage()
            .then((state) => {
                if (state && state.isRecording && state.explorationNumber !== undefined && state.explorationLength !== undefined) {
                    const newAction = new Action(prefix, suffix, state.explorationLength);
                    const promises = [];
        
                    if (state.takeAScreenshotByAction) {
                        promises.push(this.takeScreenShot(state.explorationLength));
                    }
        
                    
                    if (!state.serverURL ||  !state.sessionId) {
                        throw new Error("Not connected to a session")
                    }
                    console.log(`processNewAction : ${newAction.kind} ${newAction.value}`);
                    const pushActionListPromise = this._aifexService.pushActionOrObservationList(
                        state.serverURL, 
                        state.sessionId, 
                        state.explorationNumber, 
                        [newAction])
    
                    promises.push(pushActionListPromise);
                    
                    console.log(`there are ${promises.length} promises`);
                    return Promise.allSettled(promises)
                        .then((results) => {
                            state.explorationLength ? state.explorationLength++ : state.explorationLength = 1;
                            return this._browserService.setStateToStorage(state);
                        })
                        .then(() => {})
                } else {
                    return Promise.resolve();
                }
            })
    }


    stopExploration(): Promise<void> {
        return this._browserService.getStateFromStorage()
            .then((state) => {
                if (!state || !state.serverURL || !state.sessionId) {
                    throw new Error("Not connected to a session")
                }
                if (!state || !state.connectedToSession || !state.isRecording || state.explorationNumber === undefined) {
                    return Promise.resolve();
                } 
                
                return this.processNewAction("end")
                    .then(() => {
                        console.log('process end');
                        state.isRecording = false;  
                        state.explorationNumber = undefined;
                        state.explorationLength = undefined;
                        return this._browserService.setStateToStorage(state);
                    })

            })
        
    }

    private takeScreenShot(interactionIndex: number | undefined): Promise<void> {
        return this._browserService.getStateFromStorage()
            .then((state) => {
                if (state && state.explorationNumber && state.isRecording) {
                    return this._browserService.takeScreenshot()
                        .then(image => {
                            console.log("Take Screenshot ");
                            let index = interactionIndex;
                            if (state.recordActionByAction && state.serverURL && state.sessionId && state.explorationNumber) {
                                this._aifexService.addScreenshotList(
                                    state.serverURL,
                                    state.sessionId,
                                    state.explorationNumber,
                                    [new Screenshot(image, state.explorationLength ||0)]
                                );
                            }
                        })
                        .catch((error) => {
                            console.log("cannot take screenshot");
                            return Promise.resolve();
                        })
                } else {
                    return Promise.resolve();
                }

            })
        
    }
}