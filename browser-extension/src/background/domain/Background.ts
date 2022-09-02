import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import CompatibilityCheck from "./CompatibilityCheck";
import Screenshot from "./Screenshot";
import { PopupPageKind } from "./PopupPageKind";
import Action from "./Action";
import State from "./State";
import { logger } from "../Logger";

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
        return Promise.all([this._aifexService.hasModel(serverURL, modelId), this._aifexService.getSession(serverURL, sessionId)])
            .then(([modelResult, sessionResult]) => {
                if (modelResult === "Unauthorized" || sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (modelResult === false || sessionResult === undefined) {
                    return "NotFound";
                } else {
                    return this._browserService.getStateFromStorage()
                        .then((stateFromStorage) => {
                            let state = stateFromStorage || new State();
                            state.sessionBaseURL = sessionResult.baseURL;
                            state.sessionId = sessionId;
                            state.modelId = modelId;
                            state.serverURL = serverURL;
                            state.sessionDescription = sessionResult.description;
                            state.connectedToSession = true;
                            state.popupPageKind = PopupPageKind.ReadSessionDescription;
                            state.actions = [];
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
                    if (!state.serverURL ||  !state.sessionId) {
                        throw new Error("Not connected to a session")
                    }

                    const newAction = new Action(prefix, suffix, state.explorationLength);
                    const promises = [];

                    state.explorationLength ? state.explorationLength++ : state.explorationLength = 1;
                    state.actions.push(newAction);
                    console.log(`processNewAction : ${newAction.kind} ${newAction.value}`);
                    const pushActionListPromise = this._aifexService.pushActionOrObservationList(
                        state.serverURL, 
                        state.sessionId, 
                        state.explorationNumber, 
                        [newAction])
    
                    promises.push(pushActionListPromise);
                    
                    if (state.modelId) {
                        promises.push(this._aifexService.getProbabilities(state.serverURL, state.modelId, state.actions));
                    }

                    if (state.takeAScreenshotByAction) {
                        promises.push(this.takeScreenShot(state.explorationLength));
                    }
                    
                    return Promise.allSettled(promises)
                        .then(([pushResult, probaResult, screenshotResult]) => {
                            if (probaResult.status === "fulfilled" && probaResult.value) {
                                state.probabilities = probaResult.value;
                            }
                            console.log(state);
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
                        state.isRecording = false;  
                        state.explorationNumber = undefined;
                        state.explorationLength = undefined;
                        state.actions = [];
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