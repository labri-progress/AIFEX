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
import Question from "./Question";
import AifexPopup from "./AifexPopup";
import PopupService from "./PopupService";
import Evaluator from "./Evaluator";
import Screenshot from "./Screenshot";
import Comment from "./Comment"
import CommentDistribution from "./CommentDistribution";
import { OverlayType } from "./Session";

export default class Background {

    private _aifexService : AifexService;
    private _browserService : BrowserService;
    private _tabScriptService : TabScriptService;
    private _popupService: PopupService;

    private _windowManager: WindowManager;

    private _sessionId: string | undefined;
    private _modelId: string | undefined;
    private _serverURL: string | undefined;
    private _webSite: WebSite | undefined;
    private _sessionBaseURL: string | undefined;

	private _testerName: string | "anonymous";
    private _exploration: Exploration | undefined;
    private _numberOfExplorationsMadeByTester: number;

    private _evaluator: Evaluator | undefined;
    private _explorationEvaluation: ExplorationEvaluation | undefined;
    private _rejectIncorrectExplorations: boolean;


    private _probabilityMap: Map<string, number>;
    private _commentDistributions: CommentDistribution[] | undefined;
    private _commentsUp : Comment[];

    private _isRecording: boolean;
    private _useTestScenario: boolean;
    private _popupCommentPosition : {x:string, y:string};
    private _screenshotList : Screenshot[];

    private _mediaRecordManager : MediaRecorderManager;

    private _shouldCreateNewWindowsOnConnect: boolean;
    private _shouldCloseWindowOnDisconnect: boolean;

    private _aifexPopup: AifexPopup;
    private _overlayType: OverlayType;

    constructor(aifexService : AifexService, popupService: PopupService, browserService : BrowserService, tabScriptService : TabScriptService) {
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
        this._useTestScenario = false;
        this._testerName = "anonymous";
        this._numberOfExplorationsMadeByTester = 0;

        this._overlayType = "rainbow";

        this._probabilityMap = new Map();
        this._commentDistributions = [];
        this._commentsUp = [];
        this._popupCommentPosition = { x:"75%", y:"75%"};
        this._screenshotList = [];
        this._exploration = new Exploration();
        this._explorationEvaluation = undefined;
        this._isRecording = false;
        this._rejectIncorrectExplorations = true;
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
        this._popupCommentPosition = { x:"75%", y:"75%"};
        this._screenshotList = [];
        this._exploration = new Exploration();
        this._explorationEvaluation = undefined;
        this._isRecording = false;
    }

    makeCompatibilityCheck(serverURL: string) : Promise<CompatibilityCheck> {
        return this._aifexService.getPluginInfo(serverURL)
            .then((pluginInfo) => {
                return new CompatibilityCheck(this._browserService.getExtensionVesion(), pluginInfo.version, pluginInfo.url);
            })
    }

    connect(serverURL: string, sessionId: string, modelId: string) : Promise<void>{
        this.initialize();
        return this._aifexService.hasModel(serverURL, modelId)
        .then((hasModel : boolean) => {
            if (! hasModel) {
                return Promise.reject('model not found');
            }
        })
        .then( () => {
            return this._aifexService.getSession(serverURL, sessionId)
        })
            .then((session) => {
                if (session) {
                    console.log(session)

                    this._sessionBaseURL = session.baseURL;
                    this._overlayType = session.overlayType as OverlayType;
                    this._useTestScenario = session.useTestScenario;
                    return session.webSiteId;
                } else {
                    return Promise.reject('session not found');
                }
        })
        .then((webSiteId) => {
            return this._aifexService.getWebSite(serverURL, webSiteId);
        })
        .then((webSite : WebSite | undefined) => {
            if (webSite) {
                this._webSite = webSite;
                this._sessionId = sessionId;
                this._modelId = modelId;
                this._serverURL = serverURL;
                if (this._useTestScenario) {
                    return this._aifexService.getEvaluator(serverURL, webSite.id)
                        .then((evaluator: Evaluator | undefined) => {
                            if (evaluator === undefined) {
                                this._useTestScenario = false;
                            } else {
                                this._useTestScenario = true;
                                this._evaluator = evaluator;
                            }
                        }) 
                }
            } else {
                return Promise.reject(`webSite is undefined`);
            }
        })
        .then (() => {
            if (this._shouldCreateNewWindowsOnConnect) {
                this._windowManager.createConnectedWindow(this._sessionBaseURL);
            } else {
                this._windowManager.connectToExistingWindow();
            }
        })
        .then(() => this.updateNumberOfExplorationByTester())
        .then(() => this.refreshPopup())
    }

    disconnect(): Promise<void> {
        this._sessionId = undefined;
        this._modelId = undefined;
        this._serverURL = undefined;
        this._sessionBaseURL = undefined;
        this._webSite = undefined;
        this._isRecording = false;
        this._exploration = new Exploration();
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
    }

    isConnected() : boolean {
        return this._sessionId !== undefined;
    }

    reloadWebsite() : Promise<void> {
        if (!this._webSite || !this._serverURL) {
            return Promise.resolve();
        }
        return this._aifexService.getWebSite(this._serverURL, this._webSite.id)
        .then((webSite) => {
            this._webSite = webSite;
        })
        .then((_) => {
            const state = this.getStateForTabScript();
            const tabIds = this._windowManager.getConnectedTabIds();
            return Promise.all(tabIds.map(id => this._tabScriptService.reload(id, state)));
        })
        .then(() => this.refreshPopup())
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

    startExploration() : Promise<void> {
        if (!this._isRecording) {
            this._exploration = new Exploration();
            this._isRecording = true;
            return this.processNewAction("start")
            .then(() => {
                const state = this.getStateForTabScript();
                const tabIds = this._windowManager.getConnectedTabIds();
                return Promise.all(tabIds.map(id => this._tabScriptService.startExploration(id, state)));
            })
            .catch((e) => {
                this._exploration = undefined;
                this._isRecording = false;
                console.error(e)
            })
            .then(() => {
                return this._mediaRecordManager.startRecording()
                .catch((e) => {
                    this._mediaRecordManager.destroyRecording();
                    console.error(e)
                })
            })
            .then(() => {
                if (this._useTestScenario) {
                    this.evaluateExploration();
                }
            })
            .then(() => this.refreshPopup())
        } else {
            return Promise.resolve();
        }
    }

    removeExploration() : Promise<void> {
        if (this._isRecording) {
            this._mediaRecordManager.stopRecording();
            this._exploration = undefined;
            this._isRecording = false;
            const state = this.getStateForTabScript();
            const tabIds = this._windowManager.getConnectedTabIds();
            return Promise.all(tabIds.map(id => this._tabScriptService.stopExploration(id, state)))
            .then((_ : void[]) => {
                return this._windowManager.reloadConnectedWindow(this._sessionBaseURL);
            })
        } else {
            return this._windowManager.reloadConnectedWindow(this._sessionBaseURL);
        }
    }

    evaluateExploration(): Promise<void> {
        if (this._webSite && this._exploration && this._serverURL) {
            return this._aifexService.evaluateSequence(this._serverURL, this._webSite, this._exploration)
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
            return this._aifexService.getProbabilityMap(this._serverURL, this._modelId, this._exploration).then((probabilityMap) => {
                this._probabilityMap = probabilityMap
            })
        } else {
            return Promise.resolve();
        }
        
    }

    private fetchComments(): Promise<void> {
        if (!this._sessionId ) {
			return Promise.reject("Not connected to a session");
        }
        if (this._serverURL && this._exploration && this._modelId) {
            if (this._exploration.actions.length === 0) {
                return Promise.resolve();
            } else {
                return this._aifexService.getCommentDistributions(this._serverURL, this._modelId, this._exploration)
                .then((commentDistributionList) => {
                    this._commentDistributions = commentDistributionList;
                })
            }
        } else {
            return Promise.resolve();
        }
        
    }

    getProbabilityMap():Map<string, number> {
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

    processNewAction(prefix : string, suffix? : string): Promise<void> {
        if (this._isRecording && this._exploration) {
            this._exploration.addAction(prefix, suffix);
            this._commentsUp = [];

            let evaluatePromise;
            if (this._useTestScenario) {
                evaluatePromise = this.evaluateExploration();
            } else {
                evaluatePromise = Promise.resolve();
            }

            const promises = [
                this.fetchComments(),
                evaluatePromise
            ]
            if (this._overlayType === "rainbow") {
                promises.push(this.fetchProbabilityMap())
            }
            return Promise.all(promises)
            .then(() => this.refreshPopup())
            .catch((error) => console.error("Failed to process new action : ", prefix, error))
        } else {
            return Promise.resolve();
        }
    }

    addAnswerToExploration(question: Question, value: boolean) : Promise<void> {
		if (this._isRecording && this._exploration) {
            this._exploration.addAnswer(question.text, value.toString());

            return this.evaluateExploration()
            .then(() => this.refreshPopup())
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

    private stopRecordingExploration(): Promise<void> {
        if (this._isRecording && this._exploration) {
            let exploration : Exploration = this._exploration;
            return this.evaluateExploration()
                .then(() => {
                    if (!this._explorationEvaluation?.isAccepted && this._rejectIncorrectExplorations) {
                        this.displayInvalidExploration();
                        return Promise.reject(new Error("Exploration is incorrect."))
                    }
                    else {
                        return this._mediaRecordManager.stopRecording()
                        .then(() => {
                            exploration.addAction("end");
                            exploration.stop();
                            const MIN_NUMBER_OF_ACTIONS = 2;
                            const HAS_MORE_THAN_START_END_ACTIONS = exploration.actions.length > MIN_NUMBER_OF_ACTIONS;
                            if (this._isRecording && HAS_MORE_THAN_START_END_ACTIONS) {
                                return this.sendExploration();
                            }
                        })
                        .then(() => {
                            this._isRecording = false;
                            this._exploration = new Exploration();
                            this._screenshotList = [];
                            this._commentsUp = [];
                            const state = this.getStateForTabScript();
                            const tabIds = this._windowManager.getConnectedTabIds();
                            return Promise.all(tabIds.map(id => this._tabScriptService.stopExploration(id, state)))
                        })
                        .then((_ : void[]) => {
                        })
                }
            })
        } else {
            return Promise.resolve();
        }
    }

    stopExploration(): Promise<void> {
        return this.stopRecordingExploration().catch(e => {
            if (e.message !== "Exploration is incorrect.") {
                throw e;
            }
        });
    }

    restartExploration(): Promise<void> {
        return this.stopRecordingExploration()
            .then(() => {
                return this._windowManager.reloadConnectedWindow(this._sessionBaseURL);
            })
            .then(() => {
                return this.startExploration();
            })
            .catch(e => {
                if (e.message !== "Exploration is incorrect.") {
                    throw e;
                }
            })
	}

    sendExploration(): Promise<void> {
        if (this._serverURL && this._exploration && this._sessionId) {
            const EXPLORATION_CONTAINS_START_ONLY = this._exploration.actions.length === 1;

            if (! this._isRecording ||  EXPLORATION_CONTAINS_START_ONLY) {
                return Promise.resolve();
            }

            return this._aifexService.addExploration(
                this._serverURL,
                this._sessionId,
                this._testerName,
                this._exploration
            )
            .then((explorationNumber) => {
                let screenShotPromise;
                if (this._serverURL && this._sessionId && this._screenshotList.length > 0) {
                    screenShotPromise = this._aifexService.addScreenshotList(
                        this._serverURL,
                        this._sessionId,
                        explorationNumber,
                        this._screenshotList
                    );
                } else {
                    screenShotPromise = Promise.resolve();
                }

                let mediaPromise;
                if (this._serverURL && this. _sessionId && this._mediaRecordManager.isPreparedToRecordMedia) {
                    const video = this._mediaRecordManager.getRecordedChunks();
                    if (video) {
                        mediaPromise = this._aifexService.addVideo(
                            this._serverURL,
                            this._sessionId,
                            explorationNumber,
                            video
                        )
                    } else {
                        mediaPromise = Promise.resolve();
                    }
                } else {
                    mediaPromise = Promise.resolve();
                }
                return Promise.all([screenShotPromise, mediaPromise]);
            })
            .then( () => {
                return this.updateNumberOfExplorationByTester()
            });
        } else {
            return Promise.resolve();
        }   
    }

    displayInvalidExploration(): Promise<void> {
        return this._popupService.displayInvalidExploration();
    }

    changeTesterName(name:string): void {
        this._testerName = name;
    }

    updateNumberOfExplorationByTester(): Promise<void> {
        if (!this._testerName) {
            this._numberOfExplorationsMadeByTester = 0;
            return this.refreshPopup();
        }
        if (this._serverURL && this._sessionId) {
            return this._aifexService.getNumberOfExplorationForTesterName(this._serverURL, this._sessionId, this._testerName)
                .then((numberOfExploration) => {
                    this._numberOfExplorationsMadeByTester = numberOfExploration;
                    return this.refreshPopup();
                })
        } else {
            return Promise.resolve();
        }
    }

    setPopupCommentPosition(position : {x: string, y: string}): void {
        this._popupCommentPosition = position;
    }

    getStateForPopup() : StateForPopup {
        const state = new StateForPopup();
        state.serverURL = this._serverURL;
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
            state.evaluatorScenario = this._evaluator.scenario;
        }
        if (this._explorationEvaluation && this._webSite) {
            state.readEvaluation(this._explorationEvaluation, this._webSite);
        }
        return state;
    }


    getStateForTabScript() : StateForTabScript {
        const state = new StateForTabScript();
        state.isRecording = this._isRecording;
        state.webSite = this._webSite;
        state.popupCommentPosition = this._popupCommentPosition;
        state.overlayType = this._overlayType;
        return state;
    }

    takeScreenShot(): Promise<void> {
        let windowId = this._windowManager.getConnectedWindowId();
        if (windowId && this._exploration) {
            let exploration = this._exploration;
            return this._browserService.takeScreenshot(windowId)
            .then(image => {
                this._screenshotList.push(new Screenshot(image,exploration.length - 1));
            })
        } else {
            return Promise.resolve();
        } 
    }

    setRecordMedia(recordMedia : boolean) : Promise<void>{
        if (recordMedia) {
            if (this._isRecording) {
                return this._mediaRecordManager.prepareRecording()
                .then(()=> {
                    this._mediaRecordManager.startRecording();
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