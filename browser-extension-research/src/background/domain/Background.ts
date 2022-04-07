import AifexService from "./AifexService";
import BrowserService from "./BrowserService";
import CompatibilityCheck from "./CompatibilityCheck";
import Exploration from "./Exploration";
import StateForPopup from "./StateForPopup";
import WebSite from "./Website";
import WindowManager from "./WindowManager";
import StateForTabScript from "./StateForTabScript";
import TabScriptService from "./TabScriptService";
import MediaRecorderManager from "./MediaRecorderManager";
import ExplorationEvaluation from "./ExplorationEvaluation";
import AifexPopup from "./AifexPopup";
import PopupService from "./PopupService";
import Evaluator from "./Evaluator";
import Screenshot from "./Screenshot";
import Observation from "./Observation"
import ObservationDistribution from "./ObservationDistribution";
import { OverlayType } from "./Session";
import { PopupPageKind } from "./PopupPageKind";
import Token from "./Token";
import { logger } from "../Logger";

export default class Background {

    private _aifexService: AifexService;
    private _browserService: BrowserService;
    private _tabScriptService: TabScriptService;
    private _popupService: PopupService;

    private _windowManager: WindowManager;

    private _sessionId: string | undefined;
    private _sessionDescription: string | undefined;
    private _modelId: string | undefined;
    private _serverURL: string | undefined;
    private _webSite: WebSite | undefined;
    private _sessionBaseURL: string | undefined;

    private _testerName: string | "anonymous";
    private _token: Token | undefined;

    private _exploration: Exploration | undefined;
    private _numberOfExplorationsMadeByTester: number;

    private _evaluator: Evaluator | undefined;
    private _explorationEvaluation: ExplorationEvaluation | undefined;
    private _rejectIncorrectExplorations: boolean;

    private _probabilityMap: Map<string, number>;
    private _observationDistributions: ObservationDistribution[] | undefined;
    private _observationsUp: Observation[];
    private _lastInteractionObservation: Observation | undefined;

    private _popupPageKind: PopupPageKind;
    private _showConfig: boolean;
    private _isActive: boolean;
    private _screenshotList: Screenshot[];

    private _mediaRecordManager: MediaRecorderManager;

    private _shouldCreateNewWindowsOnConnect: boolean;
    private _shouldCloseWindowOnDisconnect: boolean;
    private _shouldOpenPrivateWindows: boolean;
    private _takeAScreenshotByAction: boolean;

    private _aifexPopup: AifexPopup;
    private _overlayType: OverlayType;
    private _showProbabilityPopup: boolean;
    
    private _recordActionByAction: boolean | undefined;

    constructor(aifexService: AifexService, popupService: PopupService, browserService: BrowserService, tabScriptService: TabScriptService) {
        this._aifexService = aifexService;
        this._browserService = browserService;
        this._tabScriptService = tabScriptService;
        this._popupService = popupService;

        this._mediaRecordManager = new MediaRecorderManager(this._browserService);
        this._windowManager = new WindowManager(browserService);
        this._windowManager.attachHandlers();
        this._shouldCreateNewWindowsOnConnect = true;
        this._shouldCloseWindowOnDisconnect = true;
        this._shouldOpenPrivateWindows = false;
        this._takeAScreenshotByAction = true;
        this._aifexPopup = new AifexPopup(this._browserService);
        this._aifexPopup.attachBrowserHandlers();

        this._isActive = false;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0;
        this._popupPageKind = PopupPageKind.Home;
        this._showConfig = false;

        this._overlayType = "rainbow";
        this._showProbabilityPopup = false;

        this._probabilityMap = new Map();
        this._observationDistributions = [];
        this._observationsUp = [];
        this._lastInteractionObservation = undefined;
        this._screenshotList = [];
        this._explorationEvaluation = undefined;
        this._rejectIncorrectExplorations = true;

        this._windowManager.addOnWindowRemovedListener((windowId) => {
            if (this._windowManager.getConnectedWindowId() === windowId){
                this.disconnect();
            }
        });
    }

    private initialize(): void {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._probabilityMap = new Map();
        this._observationDistributions = [];
        this._observationsUp = [];
        this._screenshotList = [];
        this._explorationEvaluation = undefined;
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

    linkServer(serverURL: string): Promise<"LinkedToServer"> {
        this.initialize();
        return this._aifexService.ping(serverURL)
            .then(() => {
                this._serverURL = serverURL;
                return "LinkedToServer";
            })
    }

    unlinkServer(): void {
        this.initialize();
    }

    signin(username: string, password: string): Promise<"SignedIn" | "Unauthorized"> {
        if (this._serverURL === undefined) {
            return Promise.reject("Server URL is not defined");
        } else {
            return this._aifexService.signin(this._serverURL, username, password)
                .then((result) => {
                    if (result === "Unauthorized") {
                        return "Unauthorized";
                    } else {
                        this._token = result;
                        this._testerName = username;
                        return "SignedIn";
                    }
                })
        }
    }

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
        this.initialize();
        logger.debug("exploration size : " + this._exploration?.length);
        return this._aifexService.getSession(serverURL, sessionId, this._token)
            .then((sessionResult) => {
                if (sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (sessionResult === undefined) {
                    return "NotFound";
                } else {
                    this._recordActionByAction = sessionResult.recordingMode === "byinteraction";
                    logger.debug("Recording mode: " + this._recordActionByAction);
                    this._sessionBaseURL = sessionResult.baseURL;
                    this._sessionDescription = sessionResult.description;
                    this._overlayType = sessionResult.overlayType as OverlayType;                    
                    this._sessionId = sessionId;
                    this._serverURL = serverURL;
                    let windowManagement;
                    if (this._shouldCreateNewWindowsOnConnect) {
                        windowManagement = this._windowManager.createConnectedWindow(this._shouldOpenPrivateWindows, this._sessionBaseURL);
                    } else {
                        windowManagement = this._windowManager.connectToExistingWindow();
                    }
                    return windowManagement
                        .then(() => {
                            this._popupPageKind = PopupPageKind.ReadSessionDescription;
                            return "Connected";
                        })
                } 
            })
    }

    disconnect(): Promise<void> {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._serverURL = undefined;
        this._evaluator = undefined;
        this._sessionBaseURL = undefined;
        this._webSite = undefined;
        this._isActive = false;
        this._exploration = undefined;
        this._screenshotList = [];
        this._observationsUp = [];
        this._popupPageKind = PopupPageKind.Home;

        if (this._shouldCloseWindowOnDisconnect) {
            return this._windowManager.removeConnectedWindow();
        } else {
            return Promise.resolve();
        }
    }

    isConnected(): boolean {
        return this._sessionId !== undefined;
    }

    drawAttention(): Promise<void> {
        const id = this._windowManager.getConnectedWindowId();
        if (this._sessionId && id !== undefined && id !== null) {
            return this._browserService.drawAttentionToWindow(id);
        }
        else {
            console.log("Reload")
            return this._windowManager.createConnectedWindow(this._shouldOpenPrivateWindows, this._sessionBaseURL)
        }
    }

    createExploration(): Promise<void> {
        if (this._serverURL === undefined || this._sessionId === undefined) {
            throw new Error("Not connected to a session")
        }
        return this._aifexService.createEmptyExploration(this._serverURL, this._sessionId, this._testerName)
            .then(explorationNumber => {
                this._exploration = new Exploration(explorationNumber);
            })
    }

    startExploration() : Promise<void> {
        logger.debug('startExploration');
        if (this._isActive) {
                logger.debug('isActive');
                return Promise.resolve();
        } 
        return this._windowManager.reloadConnectedWindow(this._sessionBaseURL)
            .then(() => {
                logger.debug('reloadConnected');
                this._isActive = true;

                return this.createExploration()
                    .then(() => {
                        logger.debug('exploration created');
                        return this.processNewAction("start");
                    })
                    .then(() => {
                        logger.debug('start action');
                        const state = this.getStateForTabScript();
                        const tabIds = this._windowManager.getConnectedTabIds();

                        logger.debug('state and tabIds are ok');

                        return Promise.all(tabIds.map(tabId => this._tabScriptService.startExploration(tabId, state)));
                    })
                    .catch((e) => {
                        logger.debug('messages error, not sent to tabScript');
                        this._exploration = undefined;
                        this._isActive = false;
                        throw new Error(e);
                    })
                    .then(() => {
                        return this._mediaRecordManager.startRecording()
                            .catch((e) => {
                                this._mediaRecordManager.destroyRecording();
                                console.error(e)
                            })
                    })        
            })
    }

    removeExploration(): Promise<void> {
        if (this._isActive) {
            this._mediaRecordManager.stopRecording();
            this._exploration = undefined;
            this._isActive = false;
            const state = this.getStateForTabScript();
            const tabIds = this._windowManager.getConnectedTabIds();
            return Promise.all(tabIds.map(id => this._tabScriptService.stopExploration(id, state)))
                .then((_: void[]) => {
                    return this._windowManager.reloadConnectedWindow(this._sessionBaseURL);
                })
        } else {
            return this._windowManager.reloadConnectedWindow(this._sessionBaseURL);
        }
    }
    processNewAction(prefix: string, suffix?: string): Promise<void> {
        if (this._isActive && this._exploration) {
            this._exploration.addAction(prefix, suffix);
            this._observationsUp = [];
            this._lastInteractionObservation = undefined
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
                logger.debug(`processNewAction, lastAction: ${lastAction.kind} ${lastAction.value}`);
                const pushActionListPromise = this._aifexService.pushActionOrObservationList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [lastAction])

                promises.push(pushActionListPromise);
            }
            logger.debug(`there are ${promises.length} promises`);
            return Promise.all(promises)
                .then(() => {
                    logger.debug('will refreshPopup');
                    this.refreshPopup();
                })

        } else {
            return Promise.resolve();
        }
    }

    refreshPopup(): Promise<void> {
        return this._popupService.refresh(this.getStateForPopup())
    }


    private stopRecordingExploration(): Promise<void> {
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
                this._isActive = false;
                exploration.setStopDate();
                if (!this._recordActionByAction) {
                    const MIN_NUMBER_OF_ACTIONS = 3; //start + oneUserAction + end
                    const HAS_MORE_THAN_START_END_ACTIONS = exploration.actions.length >= MIN_NUMBER_OF_ACTIONS;
                    if (HAS_MORE_THAN_START_END_ACTIONS) {
                        return this.sendExploration()
                    } else {
                        //remove exploration
                        return this.removeExploration();
                    }
                }
            })
            .then(() => {
                logger.debug("stopRecording Video and sendScreenshotsAndVideo");
                return this._mediaRecordManager.stopRecording()
                .then(() => {
                    this.sendScreenshotsAndVideo();
                });
            })
            .then(() => {
                logger.debug("ask tabs to stop recording the exploration");
                this._exploration = undefined;
                this._screenshotList = [];
                this._observationsUp = [];
                const state = this.getStateForTabScript();
                const tabIds = this._windowManager.getConnectedTabIds();
                return Promise.all(tabIds.map(id => this._tabScriptService.stopExploration(id, state)))
            })
            .then((_ : void[]) => {
                return;
            })
            .catch((error) => {
                console.error(error.message);
                return;
            })
    }

    stopExploration(): Promise<void> {
        return this.stopRecordingExploration()
    }

    sendExploration(): Promise<void> {
        if (this._serverURL && this._exploration && this._sessionId && !this._recordActionByAction) {
            return this._aifexService.pushActionOrObservationList(
                this._serverURL,
                this._sessionId,
                this._exploration.explorationNumber,
                this._exploration.actionsAndObservations
            ).then(()=>{})
        } else {
            return Promise.resolve();
        }
    }

    sendScreenshotsAndVideo(): Promise<void> {       
        logger.debug(`shoud send screenshots and video, serverURL:${this._serverURL}, sessionId: ${this._sessionId}, screenshots:${this._screenshotList.length}, video: ${this._mediaRecordManager.isPreparedToRecordMedia}`);

        let addScreenshots : Promise<void> = Promise.resolve();
        if (this._serverURL && this._sessionId && this._exploration && this._screenshotList.length > 0) {
            addScreenshots = this._aifexService.addScreenshotList(
                this._serverURL,
                this._sessionId,
                this._exploration.explorationNumber,
                this._screenshotList
            );
        }

        let addVideo : Promise<void> = Promise.resolve();
        if (this._serverURL && this._sessionId && this._exploration && this._mediaRecordManager.isPreparedToRecordMedia) {
            const video = this._mediaRecordManager.getRecordedChunks();
            logger.debug(`video size: ${video?.size}`);
            if (video) {
                addVideo = this._aifexService.addVideo(
                    this._serverURL,
                    this._sessionId,
                    this._exploration.explorationNumber,
                    video
                )
            }
        }

        return Promise.all([addScreenshots, addVideo]).then(() => {});
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
        state.token = this._token;

        if (this._serverURL && this._sessionId && this._modelId) {
            state.url = `${this._serverURL}/join?sessionId=${this._sessionId}&modelId=${this._modelId}`;
        }

        state.sessionDescription = this._sessionDescription;
        state.numberOfExplorationsMadeByTester = this._numberOfExplorationsMadeByTester;
        state.isRecording = this._isActive;
        state.testerName = this._testerName;
        state.hasBaseURL = this._sessionBaseURL !== undefined;
        state.managedWindowId = this._windowManager.getConnectedWindowId();
        if (this._exploration) {
            state.interactionList = this._exploration.actions.map(interaction => interaction.toPrintableText());
        }
        state.isPreparedToRecordMedia = this._mediaRecordManager.isPreparedToRecordMedia;
        state.showConfig = this._showConfig;
        state.shouldCreateNewWindowsOnConnect = this._shouldCreateNewWindowsOnConnect;
        state.shouldCloseWindowOnDisconnect = this._shouldCloseWindowOnDisconnect;
        state.shouldOpenPrivateWindows = this._shouldOpenPrivateWindows;
        state.takeAScreenshotByAction = this._takeAScreenshotByAction;
        logger.debug("state.shouldOpenPrivateWindows" + state.shouldOpenPrivateWindows + " / this._shouldOpenPrivateWindows" + this._shouldOpenPrivateWindows)

        state.popupIsDetached = this._aifexPopup.isDetached;
        state.showProbabilityPopup = this._showProbabilityPopup;

        state.observationUpList = this._observationsUp;
        state.lastInteractionObservation = this._lastInteractionObservation;
        state.observationDistributionList = this._observationDistributions || [];

        if (this._evaluator) {
            state.evaluatorScenario = this._evaluator.description;
        }
        if (this._explorationEvaluation && this._webSite) {
            state.readEvaluation(this._explorationEvaluation, this._webSite);
        }
        return state;
    }


    getStateForTabScript(): StateForTabScript {
        const state = new StateForTabScript();
        state.isActive = this._isActive;
        state.webSite = this._webSite;
        state.overlayType = this._overlayType;
        state.showProbabilityPopup = this._showProbabilityPopup;
        return state;
    }

    takeScreenShot(interactionIndex: number | undefined): Promise<void> {
        let windowId = this._windowManager.getConnectedWindowId();
        if (windowId && this._exploration) {
            let exploration = this._exploration;
            return this._browserService.takeScreenshot(windowId)
                .then(image => {
                    logger.debug("Take Screenshot ");
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
                    logger.warn("cannot take screenshot");
                    return Promise.resolve();
                })
        } else {
            return Promise.resolve();
        }
    }

    setRecordMedia(recordMedia: boolean): Promise<void> {
        logger.debug('setRecordMedia:'+ recordMedia);
        if (recordMedia) {
            if (this._isActive) {
                return this._mediaRecordManager.prepareRecording()
                    .then(() => {
                        return this._mediaRecordManager.startRecording();
                    })
            } else {
                if (!this._mediaRecordManager.isPreparedToRecordMedia) {
                    return this._mediaRecordManager.prepareRecording().then(()=>{});
                } else {
                    return Promise.resolve();
                }
            }
        } else {
            return this._mediaRecordManager.destroyRecording();
        }
    }

    setTakeAsScreenshotByAction(takeAScreenshotByAction : boolean) {
        this._takeAScreenshotByAction = takeAScreenshotByAction;
    }

    setShouldCreateNewWindowOnConnect(shouldCreateNewWindowOnConnect: boolean): void {
        this._shouldCreateNewWindowsOnConnect = shouldCreateNewWindowOnConnect;
    }

    setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect: boolean): void {
        this._shouldCloseWindowOnDisconnect = shouldCloseWindowOnDisconnect;
    }

    setShouldOpenPrivateWindow(shouldOpenPrivateWindows: boolean): void {
        this._shouldOpenPrivateWindows = shouldOpenPrivateWindows;
    }

    toggleDetachPopup(): Promise<void> {
        return this._aifexPopup.toggleDetached()
            .catch((error) => {
                console.error("Failed to toggle Popup detach", error.message);
            })
    }

    showConfig(): void {
        this._showConfig = !this._showConfig;
	}

	submitConfig(testerName: string, shouldCreateNewWindowsOnConnect: boolean, shouldCloseWindowOnDisconnect: boolean, shouldOpenPrivateWindows: boolean, showProbabilityPopup: boolean): void {
        this._testerName = testerName;
        this._shouldCloseWindowOnDisconnect = shouldCloseWindowOnDisconnect;
        this._shouldCreateNewWindowsOnConnect = shouldCreateNewWindowsOnConnect;
        this._shouldOpenPrivateWindows = shouldOpenPrivateWindows;
        logger.debug("this._shouldOpenPrivateWindows" + this._shouldOpenPrivateWindows)
        this._showConfig = false;
        this._showProbabilityPopup = showProbabilityPopup;
	}
	
	cancelConfig(): void {
		this._showConfig = false;
	}

}