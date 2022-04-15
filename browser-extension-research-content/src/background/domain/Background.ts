import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import CompatibilityCheck from "./CompatibilityCheck";
import Exploration from "./Exploration";
import StateForPopup from "./StateForPopup";
import StateForTabScript from "./StateForTabScript";
import Screenshot from "./Screenshot";
import { PopupPageKind } from "./PopupPageKind";

export default class Background {

    private _aifexService: AifexService;
    private _browserService: BrowserService;

    private _sessionId: string | undefined;
    private _serverURL: string | undefined;
    private _sessionBaseURL: string | undefined;

    private _testerName: string | "anonymous";

    private _exploration: Exploration | undefined;
    private _numberOfExplorationsMadeByTester: number;

    private _popupPageKind: PopupPageKind;
    private _isActive: boolean;
    private _screenshotList: Screenshot[];

    private _takeAScreenshotByAction: boolean;

    private _recordActionByAction: boolean | undefined;

    private _tabLink : any | undefined;

    constructor(aifexService: AifexService,  browserService: BrowserService) {
        this._aifexService = aifexService;
        this._browserService = browserService;

        this._takeAScreenshotByAction = true;

        this._isActive = false;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0;
        this._popupPageKind = PopupPageKind.Home;
        this._screenshotList = [];
    }

    private initialize(): void {
        console.log('initialize');
        this._sessionId = undefined;
        this._screenshotList = [];
        this._isActive = false;
    }

    changePopupPageKind(popupPageKind: PopupPageKind): void {
        this._popupPageKind = popupPageKind;
    }

    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck> {
        return this._aifexService.getPluginInfo(serverURL)
            .then((pluginInfo) => {
                return new CompatibilityCheck(this._browserService.getExtensionVesion(), pluginInfo.version, pluginInfo.url);
            });
    }

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
        this.initialize();
        console.log("exploration size : " + this._exploration?.length);
        return this._browserService.openLongLiveTab()
            .then((tab) => {
                console.log('tab opened');
                this._tabLink = tab;
                return this._aifexService.getSession(serverURL, sessionId);
            })            
            .then((sessionResult) => {
                if (sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (sessionResult === undefined) {
                    return "NotFound";
                } else {
                    this._recordActionByAction = sessionResult.recordingMode === "byinteraction";
                    console.log("Recording mode: " + this._recordActionByAction);
                    this._sessionBaseURL = sessionResult.baseURL;
                    this._sessionId = sessionId;
                    this._serverURL = serverURL;
                    this._popupPageKind = PopupPageKind.ReadSessionDescription;
                    return "Connected";
                } 
            })
    }

    disconnect(): void {
        console.log('disconnect');
        this._sessionId = undefined;
        this._serverURL = undefined;
        this._sessionBaseURL = undefined;
        this._isActive = false;
        this._exploration = undefined;
        this._screenshotList = [];
        this._popupPageKind = PopupPageKind.Home;
    }

    createExploration(): Promise<void> {
        if (this._serverURL === undefined || this._sessionId === undefined) {
            throw new Error("Not connected to a session")
        }
        console.log('will create an empty exploration for testerName: ' + this._testerName);
        return this._aifexService.createEmptyExploration(this._serverURL, this._sessionId, this._testerName)
            .then(explorationNumber => {
                this._exploration = new Exploration(explorationNumber);
            })
    }

    startExploration() : Promise<void> {
        console.log('startExploration');
        if (this._isActive) {
                console.log('isActive');
                return Promise.resolve();
        } 
        
        
        console.log('reloadConnected');
        this._isActive = true;

        return this.createExploration()
            .then(() => {
                console.log('exploration created');
                return this.processNewAction("start");
            })
            .then(() => {
                console.log('start action');
                const state = this.getStateForTabScript();

            })        
    }

    processNewAction(prefix: string, suffix?: string): Promise<void> {
        let currentAction = prefix;
        if (suffix !== undefined) {
            currentAction += "$" + suffix;
        }
        
        if (this._isActive && this._exploration) {
            this._exploration.addAction(prefix, suffix);
            const promises = [];

            if (this._takeAScreenshotByAction) {
                let actions = this._exploration.actions;
                if (actions.length === 1) {
                    promises.push(this.takeScreenShot(actions.length-1));
                } else {
                    let currentAction = actions[actions.length-1];
                    let lastAction = actions[actions.length-2];
                    if (currentAction.kind !== lastAction.kind || currentAction.value !== lastAction.value) {
                        promises.push(this.takeScreenShot(actions.length-1));
                    }
                }
            }

            if (this._recordActionByAction) {
                if (!this._serverURL ||  !this._sessionId) {
                    throw new Error("Not connected to a session")
                }
                if (this._exploration.explorationNumber === undefined) {
                    throw new Error("The exploration has not been correctly started")
                }
                const actionList = this._exploration.actions;
                const lastAction = actionList[actionList.length-1];
                console.log(`processNewAction, lastAction: ${lastAction.kind} ${lastAction.value}`);
                const pushActionListPromise = this._aifexService.pushActionOrObservationList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [lastAction])

                promises.push(pushActionListPromise);
            }
            console.log(`there are ${promises.length} promises`);
            return Promise.allSettled(promises)
                .then((results) => {
                    //type alignement
                })
        } else {
            return Promise.resolve();
        }
    }


    stopExploration(): Promise<void> {
        if (!this._isActive) {
            return Promise.resolve();
        } 
        if (this._exploration === undefined) {
            return Promise.resolve();
        }
        if (!(this._serverURL && this._sessionId)) {
            throw new Error("Not connected to a session")
        }
        if (!this._exploration) {
            throw new Error("Exploration is required")
        }
        let exploration: Exploration = this._exploration;
        
        return this.processNewAction("end")
            .then(() => {
                console.log('process end');
                this._isActive = false;
                exploration.setStopDate();
            })
            .then(() => {
                console.log("ask tabs to stop recording the exploration");
                this._exploration = undefined;
                this._screenshotList = [];
                return;
            })
    }

    changeTesterName(name: string): void {
        this._testerName = name;
    }

    updateNumberOfExplorationByTester(): Promise<void> {
        if (!this._testerName) {
            this._numberOfExplorationsMadeByTester = 0;
            return Promise.resolve();
        }
        if (this._serverURL && this._sessionId) {
            return this._aifexService.getNumberOfExplorationForTesterName(this._serverURL, this._sessionId, this._testerName)
                .then((numberOfExploration) => {
                    this._numberOfExplorationsMadeByTester = numberOfExploration;
                })
        } else {
            return Promise.resolve();
        }
    }

    getStateForPopup(): StateForPopup {
        const state = new StateForPopup();
        state.pageKind = this._popupPageKind;
        state.serverURL = this._serverURL;

        state.numberOfExplorationsMadeByTester = this._numberOfExplorationsMadeByTester;
        state.isRecording = this._isActive;
        state.testerName = this._testerName;
        state.hasBaseURL = this._sessionBaseURL !== undefined;
        if (this._exploration) {
            state.interactionList = this._exploration.actions.map(interaction => interaction.toPrintableText());
        }
        state.takeAScreenshotByAction = this._takeAScreenshotByAction;
        return state;
    }


    getStateForTabScript(): StateForTabScript {
        const state = new StateForTabScript();
        state.isActive = this._isActive;
        return state;
    }

    takeScreenShot(interactionIndex: number | undefined): Promise<void> {
        if (this._exploration) {
            let exploration = this._exploration;
            return this._browserService.takeScreenshot()
                .then(image => {
                    console.log("Take Screenshot ");
                    let index = interactionIndex || exploration.actions.length-1;
                    this._screenshotList.push(new Screenshot(image, index));
                    if (this._recordActionByAction && this._serverURL && this._sessionId && this._exploration) {
                        this._aifexService.addScreenshotList(
                            this._serverURL,
                            this._sessionId,
                            this._exploration.explorationNumber,
                            this._screenshotList
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
    }


    setTakeAsScreenshotByAction(takeAScreenshotByAction : boolean) {
        this._takeAScreenshotByAction = takeAScreenshotByAction;
    }


	submitConfig(testerName: string): void {
        this._testerName = testerName;
        console.log('testerName:'+ testerName);
	}
	
}