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
import Comment from "./Comment"
import CommentDistribution from "./CommentDistribution";
import { OverlayType } from "./Session";
import configuration from "../../../configuration.json";
import { PopupPageKind } from "./PopupPageKind";
import Token from "./Token";

export default class Background {

    private _aifexService: AifexService;
    private _browserService: BrowserService;
    private _tabScriptService: TabScriptService;
    private _popupService: PopupService;

    private _windowManager: WindowManager;

    private _sessionId: string | undefined;
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
    private _commentDistributions: CommentDistribution[] | undefined;
    private _commentsUp: Comment[];

    private _popupPageKind: PopupPageKind;
    private _isRecording: boolean;
    private _popupCommentPosition: { x: string, y: string };
    private _screenshotList: Screenshot[];

    private _mediaRecordManager: MediaRecorderManager;

    private _shouldCreateNewWindowsOnConnect: boolean;
    private _shouldCloseWindowOnDisconnect: boolean;

    private _aifexPopup: AifexPopup;
    private _overlayType: OverlayType;
    
    private _recordActionByAction: boolean;

    constructor(aifexService: AifexService, popupService: PopupService, browserService: BrowserService, tabScriptService: TabScriptService) {
        this._aifexService = aifexService;
        this._browserService = browserService;
        this._tabScriptService = tabScriptService;
        this._popupService = popupService;

        this._mediaRecordManager = new MediaRecorderManager(this._browserService);
        this._windowManager = new WindowManager(browserService);
        this._windowManager.attachHandlers();
        this._windowManager.addOnWindowRemovedListener(this.onManagedWindowRemoved.bind(this));
        this._shouldCreateNewWindowsOnConnect = true;
        this._shouldCloseWindowOnDisconnect = true;
        this._aifexPopup = new AifexPopup(this._browserService);
        this._aifexPopup.attachBrowserHandlers();

        this._isRecording = false;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0;
        this._popupPageKind = PopupPageKind.Home;

        this._overlayType = "rainbow";

        this._probabilityMap = new Map();
        this._commentDistributions = [];
        this._commentsUp = [];
        this._popupCommentPosition = { x: "75%", y: "75%" };
        this._screenshotList = [];
        this._explorationEvaluation = undefined;
        this._isRecording = false;
        this._rejectIncorrectExplorations = configuration.rejectIncorrectExplorations;
        this._recordActionByAction = configuration.recordActionByAction;
    }

    private initialize(): void {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._serverURL = undefined;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0
        this._probabilityMap = new Map();
        this._commentDistributions = [];
        this._commentsUp = [];
        this._popupCommentPosition = { x: "75%", y: "75%" };
        this._screenshotList = [];
        this._explorationEvaluation = undefined;
        this._isRecording = false;
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
        return Promise.all([this._aifexService.hasModel(serverURL, modelId, this._token), this._aifexService.getSession(serverURL, sessionId, this._token)])
            .then(([modelResult, sessionResult]) => {
                if (modelResult === "Unauthorized" || sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (modelResult === false || sessionResult === undefined) {
                    return "NotFound";
                } else {
                    this._sessionBaseURL = sessionResult.baseURL;
                    this._overlayType = sessionResult.overlayType as OverlayType;
                    return this._aifexService.getWebSite(serverURL, sessionResult.webSiteId, this._token)
                        .then((webSiteResult) => {
                            if (webSiteResult === "Unauthorized") {
                                return "Unauthorized"
                            } else if (webSiteResult === undefined) {
                                return "NotFound";
                            } else {
                                this._webSite = webSiteResult;
                                this._sessionId = sessionId;
                                this._modelId = modelId;
                                this._serverURL = serverURL;
                                let windowManagement;
                                if (this._shouldCreateNewWindowsOnConnect) {
                                    windowManagement = this._windowManager.createConnectedWindow(this._sessionBaseURL);
                                } else {
                                    windowManagement = this._windowManager.connectToExistingWindow();
                                }
                                return windowManagement
                                    .then(() => {
                                        this._popupPageKind = PopupPageKind.Explore;
                                        return "Connected";
                                    })
                            }
                        });
                } 
            });
    }

    disconnect(): Promise<void> {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._serverURL = undefined;
        this._evaluator = undefined;
        this._sessionBaseURL = undefined;
        this._webSite = undefined;
        this._isRecording = false;
        this._exploration = undefined;
        this._screenshotList = [];
        this._commentsUp = [];
        if (this._shouldCloseWindowOnDisconnect) {
            return this._windowManager.removeConnectedWindow();
        } else {
            return Promise.resolve();
        }
    }

    onManagedWindowRemoved(): void {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._serverURL = undefined;
        this._sessionBaseURL = undefined;
        this._webSite = undefined;
        this._evaluator = undefined;
    }

    isConnected(): boolean {
        return this._sessionId !== undefined;
    }

    reloadWebsite(): Promise<void> {
        if (!this._webSite || !this._serverURL) {
            return Promise.resolve();
        }
        return this._aifexService.getWebSite(this._serverURL, this._webSite.id, this._token)
            .then((webSite) => {
                //TODO: check if the website has changed
                //this._webSite = webSite;
            })
            .then((_) => {
                const state = this.getStateForTabScript();
                const tabIds = this._windowManager.getConnectedTabIds();
                return Promise.all(tabIds.map(id => this._tabScriptService.reload(id, state))).then(() => { });
            })
    }

    drawAttention(): Promise<void> {
        const id = this._windowManager.getConnectedWindowId();
        if (this._sessionId && id !== undefined && id !== null) {
            return this._browserService.drawAttentionToWindow(id);
        }
        else {
            return Promise.resolve();
        }
    }

    createExploration(): Promise<void> {
        if (this._serverURL === undefined || this._sessionId === undefined) {
            throw new Error("Not connected to a session")
        }
        if (this._recordActionByAction) {
            return this._aifexService.createEmptyExploration(this._serverURL, this._sessionId, this._testerName)
                .then(explorationNumber => {
                    this._exploration = new Exploration(explorationNumber);

                })
        } else {
            return new Promise((resolve) => {
                this._exploration = new Exploration(NaN); 
                resolve();
            });
        }
    }

    startExploration() : Promise<void> {
        if (!this._isRecording) {
            this._isRecording = true;

            return this.createExploration()
            .then(() => {
                return this.processNewAction("start");
            })
            .then(() => {
                const state = this.getStateForTabScript();
                const tabIds = this._windowManager.getConnectedTabIds();

                return Promise.all(tabIds.map(tabId => this._tabScriptService.startExploration(tabId, state)));
            })
            .catch((e) => {
                this._exploration = undefined;
                this._isRecording = false;
                throw new Error(e);
            })
            .then(() => {
                return this._mediaRecordManager.startRecording()
            })
            .then(() => {
                if (this._evaluator) {
                    this.evaluateExploration();
                }
            })
            .then(() => {
                return this._mediaRecordManager.startRecording()
                    .catch((e) => {
                        this._mediaRecordManager.destroyRecording();
                        console.error(e)
                    })
            })
            .then(() => {
                if (this._commentDistributions && this._commentDistributions.length > 0) {
                    this._browserService.setExtensionIconToReceivedNotification();
                } else {
                    this._browserService.setExtensionIconToRecording();
                }
            })
        } else {
            return Promise.resolve();
        }
    }

    removeExploration(): Promise<void> {
        if (this._isRecording) {
            this._mediaRecordManager.stopRecording();
            this._exploration = undefined;
            this._isRecording = false;
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

    evaluateExploration(): Promise<void> {
        if (this._evaluator && this._exploration && this._serverURL) {
            return this._aifexService.evaluateSequence(this._serverURL, this._evaluator, this._exploration)
            .then((evaluation) => {
                this._explorationEvaluation = evaluation;
            })
        } else {
            return Promise.resolve();
        }
    }

    getExplorationEvaluation(): ExplorationEvaluation | undefined {
        return this._explorationEvaluation;
    }

    private fetchProbabilityMap(): Promise<void> {
        if (this._exploration) {
            if (this._exploration.actions.length === 0) {
                return Promise.resolve();
            }
            if (!this._serverURL) {
                return Promise.reject("Not connected to a server");
            }

            if (!this._modelId) {
                return Promise.reject("Not connected to a model");
            }
            return this._aifexService.getProbabilityMap(this._serverURL, this._modelId, this._exploration, this._token).then((probabilityMap) => {
                this._probabilityMap = probabilityMap
            })
        } else {
            return Promise.resolve();
        }
    }

    private fetchComments(): Promise<void> {
        if (!this._sessionId) {
            return Promise.reject("Not connected to a session");
        }
        if (this._serverURL && this._exploration && this._modelId) {
            if (this._exploration.actions.length === 0) {
                return Promise.resolve();
            } else {
                return this._aifexService.getCommentDistributions(this._serverURL, this._modelId, this._exploration, this._token)
                    .then((commentDistributionList) => {
                        if (commentDistributionList === undefined) {
                            this._commentDistributions = [];
                        } else {
                            this._commentDistributions = commentDistributionList;
                        }
                    })
            }
        } else {
            return Promise.resolve();
        }

    }

    getProbabilityMap(): Map<string, number> {
        if (this._isRecording && this._exploration !== undefined && this._exploration.actions.length !== 0) {
            return this._probabilityMap;
        } else {
            return new Map();
        }
    }

    getCommentDistributions(): CommentDistribution[] {
        if (this._isRecording && this._exploration !== undefined && this._exploration.actions.length !== 0 && this._commentDistributions) {
            return this._commentDistributions;
        } else {
            return [];
        }
    }

    processNewAction(prefix: string, suffix?: string): Promise<void> {

        if (this._isRecording && this._exploration) {
            this._exploration.addAction(prefix, suffix);
            this._commentsUp = [];

            const promises = [
                this.fetchComments(),
                this.evaluateExploration(),
                this.fetchProbabilityMap()
            ];

            if (this._recordActionByAction) {
                if (!this._serverURL ||  !this._sessionId) {
                    throw new Error("Not connected to a session")
                }
                if (this._exploration.explorationNumber === undefined) {
                    throw new Error("The exploration has not been correctly started")
                }
                const actionList = this._exploration.actions;
                const lastAction = actionList[actionList.length-1];
                console.log(this._exploration)
                const pushActionListPromise = this._aifexService.pushActionList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [lastAction])

                promises.push(pushActionListPromise);
            }
            return Promise.all(promises)
                .then(() => {
                    //console.log("comments",JSON.stringify(this._commentDistributions));
                    if (this._commentDistributions && this._commentDistributions.length > 0) {
                        //console.log("with notif");
                        this._browserService.setExtensionIconToReceivedNotification();
                    } else {
                        //console.log("without notif");
                        this._browserService.setExtensionIconToRecording();
                    }
                    this.refreshPopup();
                })

        } else {
            return Promise.resolve();
        }
    }

    addCommentToExploration(comment: Comment): void {
        if (this._isRecording && this._exploration) {
            this._exploration.addComment(comment);
            this.refreshPopup()
        }
    }

    refreshPopup(): Promise<void> {
        return this._popupService.refresh(this.getStateForPopup())
    }

    upComment(comment: Comment): void {
        if (this._isRecording) {
            if (!this._commentsUp.map((comment: Comment) => comment.value).includes(comment.value)) {
                this.addCommentToExploration(comment);
                this._commentsUp.push(comment);
            }
        }
    }

    private stopRecordingExploration(): Promise<boolean> {
        if (!this._isRecording) {
            return Promise.resolve(true);
        } 
        if (this._exploration === undefined) {
            return Promise.resolve(true);
        }
        this._isRecording = false;
        let exploration: Exploration = this._exploration;
        return this.evaluateExploration()
        .then(() => {
            if (this._evaluator && !this._explorationEvaluation?.isAccepted && this._rejectIncorrectExplorations) {
                this.displayInvalidExploration();
                this._isRecording = true;
                return false;
            }
            else {
                return this.processNewAction("end")
                .then(() => {
                    exploration.stop();
                    if (!this._recordActionByAction) {
                        if (!(this._serverURL && this._sessionId)) {
                            throw new Error("Not connected to a session")
                        }
                        if (!this._exploration) {
                            throw new Error("Exploration is required")
                        }
                        const MIN_NUMBER_OF_ACTIONS = 2;
                        const HAS_MORE_THAN_START_END_ACTIONS = exploration.actions.length > MIN_NUMBER_OF_ACTIONS;
                        if (HAS_MORE_THAN_START_END_ACTIONS) {
                            return this._aifexService.createFullExploration(this._serverURL, this._sessionId, this._testerName, this._exploration)
                        }
                    }
                })
                .then(() => {
                    return this._mediaRecordManager.stopRecording()
                })
                .then(() => {
                    this._exploration = undefined;
                    this._screenshotList = [];
                    this._commentsUp = [];
                    const state = this.getStateForTabScript();
                    const tabIds = this._windowManager.getConnectedTabIds();
                    return Promise.all(tabIds.map(id => this._tabScriptService.stopExploration(id, state)))
                })
                .then((_ : void[]) => {
                    return true;
                })
                .catch((error) => {
                    console.error(error.message);
                    return false;
                })
            }
        })
    }

    stopExploration(): Promise<void> {
        return this.stopRecordingExploration().then(() => { })
    }

    restartExploration(): Promise<void> {
        return this.stopRecordingExploration()
            .then((isStopped) => {
                if (isStopped) {
                    return this._windowManager.reloadConnectedWindow(this._sessionBaseURL).then(() => this.startExploration())
                }
            })
    }

    sendExploration(): Promise<void> {
        if (this._serverURL && this._exploration && this._sessionId) {
            const EXPLORATION_CONTAINS_START_ONLY = this._exploration.actions.length === 1;

            if (EXPLORATION_CONTAINS_START_ONLY) {
                return Promise.resolve();
            }
            let createExplorationPromise;
            if (this._recordActionByAction) {
                createExplorationPromise = Promise.resolve(this._exploration.explorationNumber);
            } else {
                createExplorationPromise = this._aifexService.createFullExploration(
                    this._serverURL,
                    this._sessionId,
                    this._testerName,
                    this._exploration
                )
            }
            return createExplorationPromise
            .then((explorationNumber: number) => {
                if (this._serverURL && this._sessionId && this._screenshotList.length > 0) {
                    this._aifexService.addScreenshotList(
                        this._serverURL,
                        this._sessionId,
                        explorationNumber,
                        this._screenshotList
                    );
                }

                if (this._serverURL && this._sessionId && this._mediaRecordManager.isPreparedToRecordMedia) {
                    const video = this._mediaRecordManager.getRecordedChunks();
                    if (video) {
                        this._aifexService.addVideo(
                            this._serverURL,
                            this._sessionId,
                            explorationNumber,
                            video
                        )
                    }
                }
                return this.updateNumberOfExplorationByTester();
            })
        } else {
            return Promise.resolve();
        }
    }

    displayInvalidExploration(): Promise<void> {
        return this._popupService.displayInvalidExploration(this._explorationEvaluation, this._evaluator);
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

    setPopupCommentPosition(position: { x: string, y: string }): void {
        this._popupCommentPosition = position;
    }

    getStateForPopup(): StateForPopup {
        const state = new StateForPopup();
        state.pageKind = this._popupPageKind;
        state.serverURL = this._serverURL;
        state.token = this._token;

        if (this._serverURL && this._sessionId && this._modelId) {
            state.url = `${this._serverURL}/join?sessionId=${this._sessionId}&modelId=${this._modelId}`;

        }

        state.numberOfExplorationsMadeByTester = this._numberOfExplorationsMadeByTester;
        state.isRecording = this._isRecording;
        state.testerName = this._testerName;
        state.hasBaseURL = this._sessionBaseURL !== undefined;
        state.managedWindowId = this._windowManager.getConnectedWindowId();
        if (this._exploration) {
            state.interactionList = this._exploration.actions.map(interaction => interaction.toPrintableText());
        }
        state.isPreparedToRecordMedia = this._mediaRecordManager.isPreparedToRecordMedia;
        state.shouldCreateNewWindowsOnConnect = this._shouldCreateNewWindowsOnConnect;
        state.shouldCloseWindowOnDisconnect = this._shouldCloseWindowOnDisconnect;
        state.popupIsDetached = this._aifexPopup.isDetached;

        state.commentUpList = this._commentsUp;
        state.commentDistributionList = this._commentDistributions || [];

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
        state.isRecording = this._isRecording;
        state.webSite = this._webSite;
        state.popupCommentPosition = this._popupCommentPosition;
        state.overlayType = this._overlayType;
        state.exploration = this._exploration;
        return state;
    }

    takeScreenShot(): Promise<void> {
        let windowId = this._windowManager.getConnectedWindowId();
        if (windowId && this._exploration) {
            let exploration = this._exploration;
            return this._browserService.takeScreenshot(windowId)
                .then(image => {
                    this._screenshotList.push(new Screenshot(image, exploration.length - 1));
                })
        } else {
            return Promise.resolve();
        }
    }

    setRecordMedia(recordMedia: boolean): Promise<void> {
        if (recordMedia) {
            if (this._isRecording) {
                return this._mediaRecordManager.prepareRecording()
                    .then(() => {
                        return this._mediaRecordManager.startRecording();
                    })
            } else {
                return this._mediaRecordManager.prepareRecording();
            }
        } else {
            return this._mediaRecordManager.destroyRecording();
        }
    }

    setShouldCreateNewWindowOnConnect(shouldCreateNewWindowOnConnect: boolean): void {
        this._shouldCreateNewWindowsOnConnect = shouldCreateNewWindowOnConnect;
    }

    setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect: boolean): void {
        this._shouldCloseWindowOnDisconnect = shouldCloseWindowOnDisconnect;
    }

    toggleDetachPopup(): Promise<void> {
        return this._aifexPopup.toggleDetached()
            .catch((error) => {
                console.error("Failed to toggle Popup detach", error.message);
            })
    }

}