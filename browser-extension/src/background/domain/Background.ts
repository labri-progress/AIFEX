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
    private _commentDistributions: CommentDistribution[] | undefined;
    private _commentsUp: Comment[];
    private _lastInteractionComment: Comment | undefined;

    private _popupPageKind: PopupPageKind;
    private _popupShowConfig: boolean;
    private _isRecording: boolean;
    private _screenshotList: Screenshot[];

    private _mediaRecordManager: MediaRecorderManager;

    private _shouldCreateNewWindowsOnConnect: boolean;
    private _shouldCloseWindowOnDisconnect: boolean;
    private _shouldOpenPrivateWindows: boolean;

    private _aifexPopup: AifexPopup;
    private _overlayType: OverlayType;
    
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
        this._aifexPopup = new AifexPopup(this._browserService);
        this._aifexPopup.attachBrowserHandlers();

        this._isRecording = false;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0;
        this._popupPageKind = PopupPageKind.Home;
        this._popupShowConfig = false;

        this._overlayType = "rainbow";

        this._probabilityMap = new Map();
        this._commentDistributions = [];
        this._commentsUp = [];
        this._lastInteractionComment = undefined;
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
        this._serverURL = undefined;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0
        this._probabilityMap = new Map();
        this._commentDistributions = [];
        this._commentsUp = [];
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
        logger.debug("exploration size : " + this._exploration);
        return Promise.all([this._aifexService.hasModel(serverURL, modelId, this._token), this._aifexService.getSession(serverURL, sessionId, this._token)])
            .then(([modelResult, sessionResult]) => {
                if (modelResult === "Unauthorized" || sessionResult === "Unauthorized") { 
                    return "Unauthorized";
                } else if (modelResult === false || sessionResult === undefined) {
                    return "NotFound";
                } else {
                    this._recordActionByAction = sessionResult.recordingMode === "byinteraction";
                    logger.debug("Recording mode: " + this._recordActionByAction);
                    this._sessionBaseURL = sessionResult.baseURL;
                    this._sessionDescription = sessionResult.description;
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
                        });
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
        this._isRecording = false;
        this._exploration = undefined;
        this._screenshotList = [];
        this._commentsUp = [];
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

    reloadWebsite(): Promise<void> {
        if (!this._webSite || !this._serverURL) {
            return Promise.resolve();
        }
        return this._aifexService.getWebSite(this._serverURL, this._webSite.id, this._token)
            .then((webSite) => {
                if (webSite === "Unauthorized") {
                    throw new Error("Unauthorized to load website")
                }
                this._webSite = webSite;
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
            console.log("Reload")
            return this._windowManager.createConnectedWindow(this._shouldOpenPrivateWindows, this._sessionBaseURL)
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
        if (this._isRecording) {
                return Promise.resolve();
        } 
        return this._windowManager.reloadConnectedWindow(this._sessionBaseURL).then(() => {
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
        })
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
            this._lastInteractionComment = undefined
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
                const pushActionListPromise = this._aifexService.pushActionOrCommentList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [lastAction])

                promises.push(pushActionListPromise);
            }
            return Promise.all(promises)
                .then(() => {
                    this.refreshPopup();
                })

        } else {
            return Promise.resolve();
        }
    }

    addCommentToExploration(comment: Comment): void {
        if (this._isRecording && this._exploration) {
            this._exploration.addComment(comment);
            this._lastInteractionComment = comment;
            if (this._recordActionByAction) {
                if (!this._serverURL ||  !this._sessionId) {
                    throw new Error("Not connected to a session")
                }
                if (this._exploration.explorationNumber === undefined) {
                    throw new Error("The exploration has not been correctly started")
                }
                this._aifexService.pushActionOrCommentList(
                    this._serverURL, 
                    this._sessionId, 
                    this._exploration.explorationNumber, 
                    [comment])

            }
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

    private stopRecordingExploration(): Promise<void> {
        if (!this._isRecording) {
            return Promise.resolve();
        } 
        if (this._exploration === undefined) {
            return Promise.resolve();
        }
        let exploration: Exploration = this._exploration;
        return this.evaluateExploration()
        .then(() => {
            if (this._evaluator && !this._explorationEvaluation?.isAccepted && this._rejectIncorrectExplorations) {
                this.displayInvalidExploration();
                this._isRecording = true;
                return;
            }
            else {
                return this.processNewAction("end")
                .then(() => {
                    this._isRecording = false;
                    exploration.setStopDate();
                    if (!this._recordActionByAction) {
                        if (!(this._serverURL && this._sessionId)) {
                            throw new Error("Not connected to a session")
                        }
                        if (!this._exploration) {
                            throw new Error("Exploration is required")
                        }
                        const MIN_NUMBER_OF_ACTIONS = 3; //start + end
                        const HAS_MORE_THAN_START_END_ACTIONS = exploration.actions.length >= MIN_NUMBER_OF_ACTIONS;
                        if (HAS_MORE_THAN_START_END_ACTIONS) {
                            return this.sendExploration()
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
                    return;
                })
                .catch((error) => {
                    console.error(error.message);
                    return;
                })
            }
        })
    }

    stopExploration(): Promise<void> {
        return this.stopRecordingExploration()
    }

    sendExploration(): Promise<void> {
        if (this._serverURL && this._exploration && this._sessionId) {
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
                console.log("shoud send screenshots screenshots, ", this._serverURL, this._sessionId, this._screenshotList.length)

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
        state.isRecording = this._isRecording;
        state.testerName = this._testerName;
        state.hasBaseURL = this._sessionBaseURL !== undefined;
        state.managedWindowId = this._windowManager.getConnectedWindowId();
        if (this._exploration) {
            state.interactionList = this._exploration.actions.map(interaction => interaction.toPrintableText());
        }
        state.isPreparedToRecordMedia = this._mediaRecordManager.isPreparedToRecordMedia;
        state.showConfig = this._popupShowConfig;
        state.shouldCreateNewWindowsOnConnect = this._shouldCreateNewWindowsOnConnect;
        state.shouldCloseWindowOnDisconnect = this._shouldCloseWindowOnDisconnect;
        state.shouldOpenPrivateWindows = this._shouldOpenPrivateWindows;
        logger.debug("state.shouldOpenPrivateWindows" + state.shouldOpenPrivateWindows + " / this._shouldOpenPrivateWindows" + this._shouldOpenPrivateWindows)

        state.popupIsDetached = this._aifexPopup.isDetached;

        state.commentUpList = this._commentsUp;
        state.lastInteractionComment = this._lastInteractionComment;
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
                    console.log("Take Screenshot ", image)
                    this._screenshotList.push(new Screenshot(image, exploration.length - 1));
                    if (this._recordActionByAction && this._serverURL && this._sessionId && this._exploration) {
                        this._aifexService.addScreenshotList(
                            this._serverURL,
                            this._sessionId,
                            this._exploration.explorationNumber,
                            this._screenshotList
                        );
                    }
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
        this._popupShowConfig = !this._popupShowConfig;
	}

	submitConfig(testerName: string, shouldCreateNewWindowsOnConnect: boolean, shouldCloseWindowOnDisconnect: boolean, shouldOpenPrivateWindows: boolean): void {
        this._testerName = testerName;
        this._shouldCloseWindowOnDisconnect = shouldCloseWindowOnDisconnect;
        this._shouldCreateNewWindowsOnConnect = shouldCreateNewWindowsOnConnect;
        this._shouldOpenPrivateWindows = shouldOpenPrivateWindows;
        logger.debug("this._shouldOpenPrivateWindows" + this._shouldOpenPrivateWindows)
        this._popupShowConfig = false;
	}
	
	cancelConfig(): void {
		this._popupShowConfig = false;
	}

}