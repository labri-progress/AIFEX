import Session from "../domain/Session";
import AccountService from "../domain/AccountService";
import Mapping from "../domain/Mapping";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import Account from "../domain/Account";
import Screenshot from "../domain/Screenshot";
import { Kind } from "../domain/Kind";
import Action from "../domain/Action";
import Model from "../domain/Model";
import ModelService from "../domain/ModelService";
import { ModelPredictionType } from "../domain/ModelPredictionType";
import Video from "../domain/Video";
import ObservationDistribution from "../domain/ObservationDistribution";
import Ngram from "../domain/Ngram";
import Observation from "../domain/Observation";
import EvaluatorService from "../domain/EvaluatorService";
import Evaluator from "../domain/Evaluator";
import Evaluation from "../domain/Evaluation";
import { RecordingMode } from "../domain/RecordingMode";
import { SessionOverlayType } from "../domain/SessionOverlayType";
import { debug } from "console";
import { logger } from "../logger";
import GeneratorService from "../domain/GeneratorService";

export default class APIApplication {


    private _accountService: AccountService;
    private _webSiteService: WebSiteService;
    private _sessionService: SessionService;
    private _modelService: ModelService;
    private _evaluatorService: EvaluatorService;
    private _generatorService: GeneratorService;

    constructor(accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService, modelService: ModelService, evaluatorService: EvaluatorService, generatorService: GeneratorService) {
        this._accountService = accountService;
        this._webSiteService = webSiteService;
        this._sessionService = sessionService;
        this._modelService = modelService;
        this._evaluatorService = evaluatorService;
        this._generatorService = generatorService;
    }

    ping() {
        return Promise.all([this._accountService.ping(), this._webSiteService.ping(), this._sessionService.ping(), this._modelService.ping()])
        .then((results) => {
            return results.every((result) => result === true);
        })
        .catch(() => {
            return false;
        })
    }

    getPluginInfo(): undefined | {version: string, name: string, description: string} {
        if (process.env.PLUGIN_INFO) {
            try {
                const info = JSON.parse(process.env.PLUGIN_INFO)
                return {
                    version: info.version,
                    name: info.name,
                    description: info.description
                }
            } catch(error) {
                return 
            }
        }
    }

    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated"> {
        return this._accountService.signup(username, email, password).then((result) => {
            if (result === "UserNameAlreadyTaken") {
                return "UserNameAlreadyTaken";
            } else {
                return this.accountInitialization(username).then(() => {
                    return "AccountCreated";
                });
            }
        });
    }

    signin(username: string, password: string): Promise<Token | "Unauthorized"> {
        return this._accountService.signin(username, password);
    }

    getAccount(token: Token | undefined): Promise<Account | "Unauthorized"> {
        if (token === undefined) {
            return Promise.resolve("Unauthorized");
        } else {
            return this._accountService.getAccount(token);
        }
    }

    addInvitation(toUsername: string, kind: Kind, key: string, token: Token) : Promise<"Unauthorized" | "InvitationIsAdded" | "IncorrectUsername" > {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === key && authorization.kind === kind);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.addInvitation(account.username, toUsername, key, kind);
                    }
                }
            });
    }

    removeInvitation(toUsername: string, kind: Kind, key: string, token: Token): Promise<"Unauthorized" | "InvitationIsRemoved" |"IncorrectUsername"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === key && authorization.kind === kind);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.removeInvitation(account.username, toUsername, key, kind);
                    }
                }
            });
    }    

    createWebSite(name: string, mappingList: Mapping[], token: Token): Promise<WebSite | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    return this._webSiteService.createWebSite(name, mappingList)
                        .then((webSiteId) => {
                            return this._accountService.addWebSite(result.username, webSiteId)
                                .then((addResult) => {
                                    if (addResult === "IncorrectUsername") {
                                        return "Unauthorized";
                                    } else {
                                        return new WebSite(webSiteId, name, mappingList);
                                    }
                                });
                        });
                }
            });
    }

    updateWebSite(webSiteId: string, name: string, mappingList: Mapping[], token: Token): Promise<"Unauthorized" | "WebSiteUpdated"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === webSiteId && authorization.kind === Kind.WebSite);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._webSiteService.updateWebSite(webSiteId, name, mappingList)
                            .then((result) => result);
                    }
                }
            });
    }

    removeWebSite(webSiteId: string, token: Token): Promise<"Unauthorized" | "WebSiteRemoved"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === webSiteId && authorization.kind === Kind.WebSite);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.removeWebSite(account.username, webSiteId)
                            .then((result) => {
                                if (result === "IncorrectUsername") {
                                    return "Unauthorized";
                                } else {
                                    return "WebSiteRemoved";
                                }
                            });
                    }
                }
            });
    }

    findWebSiteById(webSiteId: string, token?: Token): Promise<WebSite | undefined | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.WebSite, webSiteId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === webSiteId && authorization.kind === Kind.WebSite);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === webSiteId && invitation.authorization.kind === Kind.WebSite);
                }
                if (isPublic || authorized || invited) {
                    return this._webSiteService.findWebSiteById(webSiteId).then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    createSession(webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode, token: Token): Promise<Session | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    return this.findWebSiteById(webSiteId, token)
                        .then((findResult) => {
                            if (findResult === undefined || findResult === "Unauthorized") {
                                return "Unauthorized";
                            } else {
                                const webSite: WebSite = findResult;
                                return this._sessionService.createSession(webSiteId, baseURL, name, description, overlayType, recordingMode)
                                    .then((sessionId) => {
                                        return this._accountService.addSession(account.username, sessionId)
                                            .then((addSessionResult) => {
                                                if (addSessionResult === "IncorrectUsername") {
                                                    return "Unauthorized";
                                                } else {
                                                    return new Session(sessionId, baseURL, webSite, name, description, new Date(), overlayType, recordingMode, []);
                                                }
                                            })
                                    });
                            }
                        });
                }
            });
    }

    updateSession(sessionId: string, webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode, token: Token): Promise<Session | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    if (!authorized) {
                        return "Unauthorized";
                    } else { 
                        return this.findWebSiteById(webSiteId, token)
                            .then((findResult) => {
                                if (findResult === undefined || findResult === "Unauthorized") {
                                    return "Unauthorized";
                                } else {
                                    const webSite: WebSite = findResult;
                                    return this._sessionService.updateSession(sessionId, webSiteId, baseURL, name, description, overlayType, recordingMode)
                                        .then(() => {
                                            return new Session(sessionId, baseURL, webSite, name, description, new Date(), overlayType, recordingMode, []);
                                        });
                                }
                            });
                    }
                }
            });
    }

    removeSession(sessionId: string, token: Token): Promise<"Unauthorized" | "SessionRemoved"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.removeSession(account.username, sessionId)
                            .then((result) => {
                                if (result === "IncorrectUsername") {
                                    return "Unauthorized";
                                } else {
                                    return "SessionRemoved";
                                }
                            });
                    }
                }
            });
    }

    findSessionById(sessionId: string, token?: Token): Promise<Session | undefined | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.findSessionById(sessionId).then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    addExploration(sessionId: string, testerName: string, interactionList: (Action | Observation)[], startDate?: Date, stopDate?: Date, token?: Token): Promise<"Unauthorized" | number> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.addExploration(sessionId, testerName, interactionList, startDate, stopDate)
                        .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    removeExploration(sessionId: string, explorationId: number, token?: Token): Promise<"Unauthorized" | "ExplorationRemoved" | "ExplorationNotFound"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.removeExploration(sessionId, explorationId)
                        .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    addInteractions(sessionId: string, explorationNumber: number, interactionList: (Action | Observation)[], token?: Token): Promise<"InteractionsAdded" | "ExplorationNotFound" | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
        .then(([isPublic, maybeAccount]) => {
            let authorized = false;
            let invited = false;
            if (maybeAccount !== "Unauthorized") {
                const account: Account = maybeAccount;
                authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
            }
            if (isPublic || authorized || invited) {
                return this._sessionService.addInteractions(sessionId, explorationNumber, interactionList)
                        .then((result) => result);
            } else {
                return "Unauthorized";
            }
        });
    }

    addScreenshots(sessionId: string, screenshots: Screenshot[], token?: Token): Promise<"Unauthorized" | "InvalidScreenshots" | "ScreenshotsAdded"> {
        if (screenshots.some(screenshot => screenshot.sessionId !== sessionId)) {
            return Promise.resolve("InvalidScreenshots");
        } else {
            return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
                .then(([isPublic, maybeAccount]) => {
                    let authorized = false;
                    let invited = false;
                    if (maybeAccount !== "Unauthorized") {
                        const account: Account = maybeAccount;
                        authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                        invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                    }
                    if (isPublic || authorized || invited) {
                        return this._sessionService.addScreenshots(screenshots);
                    } else {
                        return "Unauthorized";
                    }
                });
        }
    }

    findScreenshotsBySessionId(sessionId: string, token?: Token): Promise<Screenshot[] | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.findScreenshotsBySessionId(sessionId).then(result => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    addVideo(video: Video, token?: Token): Promise<"Unauthorized" | "InvalidVideo" | "VideoAdded"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, video.sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === video.sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === video.sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.addVideo(video);
                } else {
                    return "Unauthorized";
                }
            });
    }

    findExplorationsWithVideo(sessionId: string, token?: Token): Promise<number[] | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])   
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._sessionService.findExplorationsWithVideo(sessionId).then(result => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType, token: Token) : Promise<Model | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    return this._modelService.createModel(depth, interpolationfactor, predictionType)
                        .then((modelId) => {
                            return this._accountService.addModel(account.username, modelId)
                                .then((addResult) => {
                                    if (addResult === "IncorrectUsername") {
                                        return "Unauthorized";
                                    } else {
                                        return new Model(modelId, depth, interpolationfactor, predictionType, []);
                                    }
                                });
                        });
                }
            });
    }

    removeModel(modelId: string, token: Token): Promise<"Unauthorized" | "ModelRemoved"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.removeModel(account.username, modelId)
                            .then((result) => {
                                if (result === "IncorrectUsername") {
                                    return "Unauthorized";
                                } else {
                                    return "ModelRemoved";
                                }
                            });
                    }
                }
            });
    }

    findModelById(modelId: string, token?: Token): Promise<Model | undefined | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Model, modelId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === modelId && invitation.authorization.kind === Kind.Model);
                }
                if (isPublic || authorized || invited) {
                    return this._modelService.findModelById(modelId).then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    linkModelToSession(modelId: string, sessionId: string, token: Token): Promise<"Unauthorized" | "ModelLinkedToSession" | "ModelIsUnknown"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const modelAuthorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    const sessionAuthorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    if (!modelAuthorized && !sessionAuthorized) {
                        return "Unauthorized";
                    } else {
                        return this._modelService.linkModelToSession(modelId, sessionId)
                            .then((result) => result);
                    }
                }
            });
    }

    getCrossEntropy(sessionId: string, depth: number, predictionType: string, interpolationfactor: number, token: Token | undefined): Promise<"Unauthorized" | {explorationNumber: number, crossEntropy: number}[]> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._modelService.computeCrossEntropy(sessionId, depth, predictionType, interpolationfactor)
                        .then((result: {explorationNumber: number, crossEntropy: number}[]) => result);
                } else {
                    return "Unauthorized";
                }
            });    }

    computeProbabilities(modelId: string, interactionList: (Action | Observation)[], token?: Token): Promise<"Unauthorized" | Map<string,number>> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Model, modelId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === modelId && invitation.authorization.kind === Kind.Model);
                }
                if (isPublic || authorized || invited) {
                    return this._modelService.computeProbabilities(modelId, interactionList)
                            .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    getObservationDistributions(modelId: string, interactionList: (Action | Observation)[], token?: Token): Promise<"Unauthorized" | Map<string,ObservationDistribution[]>> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Model, modelId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === modelId && invitation.authorization.kind === Kind.Model);
                }
                if (isPublic || authorized || invited) {
                    return this._modelService.getObservationDistributions(modelId, interactionList)
                            .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    getAllNgram(modelId: string, token?: Token): Promise<"Unauthorized" | Ngram[]> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Model, modelId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === modelId && invitation.authorization.kind === Kind.Model);
                }
                if (isPublic || authorized || invited) {
                    return this._modelService.getAllNgram(modelId)
                            .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });
    }

    makeAuthorizationPublic(kind: Kind, key: string, token: Token): Promise<"Unauthorized" | "AuthorizationIsPublic"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === key && authorization.kind === kind);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.makeAuthorizationPublic(kind, key)
                            .then((result) => result);
                    }
                }
            });
    }

    revokePublicAuthorization(kind: Kind, key: string, token: Token): Promise<"Unauthorized" | "AuthorizationIsNoMorePublic"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === key && authorization.kind === kind);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._accountService.revokePublicAuthorization(kind, key)
                            .then((result) => result);
                    }
                }
            });
    }

    isAuthorizationPublic(kind: Kind, key: string) : Promise<boolean> {
        return this._accountService.isAuthorizationPublic(kind, key);
    }

    accountInitialization(username: string) : Promise<"WebSiteAdded" | "IncorrectUsername"> {
        let mappings : Mapping[] = [];
        mappings.push(new Mapping({event:"click",css:"body"},{prefix:"Click",suffix:"cssSelector"}));
        return this._webSiteService.createWebSite("Recording-Clicks",mappings)
        .then((webSiteId) => {
            return this._accountService.addWebSite(username,webSiteId)
        })
        .then(() => {
            mappings = [];
            mappings.push(new Mapping({event:"click",css:"body"},{prefix:"Click",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Enter",css:"body"},{prefix:"EnterKeyDown",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Tab",css:"body"},{prefix:"TabKeyDown",suffix:"cssSelector"}));
            return this._webSiteService.createWebSite("Recording-Clicks-EnterTabKeys",mappings)
        })
        .then((webSiteId) => {
            return this._accountService.addWebSite(username,webSiteId)
        })
        .then(() => {
            mappings = [];
            mappings.push(new Mapping({event:"click",css:"body"},{prefix:"Click",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Enter",css:"body"},{prefix:"EnterKeyDown",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Tab",css:"body"},{prefix:"TabKeyDown",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"css-class-added",css:"body"},{prefix:"MouseOver",suffix:"cssSelector"}));
            return this._webSiteService.createWebSite("Recording-Clicks-EnterTabKeys-MouseOverMoves",mappings)
        })
        .then((webSiteId) => {
            return this._accountService.addWebSite(username,webSiteId)
        })
        .then(() => {
            mappings = [];
            mappings.push(new Mapping({event:"click",css:"body"},{prefix:"Click",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Enter",css:"body"},{prefix:"EnterKeyDown",suffix:"cssSelector"}));
            mappings.push(new Mapping({event:"keydown",key:"Tab",css:"body"},{prefix:"TabKeyDown",suffix:"cssSelector"}));
            return this._webSiteService.createWebSite("RecordingWithValue-Clicks-EnterTabKeys",mappings)
        })
        .then((webSiteId) => {
            return this._accountService.addWebSite(username,webSiteId)
        })
    }

    expressionToDot(expression: string) {
        return this._evaluatorService.expressionToDot(expression);
    }

    evaluateSequenceByExpression(expression: string, actionList: Action[]): Promise<Evaluation>  {
        return this._evaluatorService.evaluateSequenceByExpression(expression, actionList);
    }

    removeEvaluator(sessionId: string, token?: Token): Promise<"Unauthorized" | void> {
        let authorized: boolean;
        let invited: boolean;
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._evaluatorService.removeEvaluator(sessionId).then(() =>{})
                }
                return "Unauthorized";
            })
    }

    createEvaluator(sessionId: string, description: string, expression: string, token?: Token): Promise<"Unauthorized" | void>  {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
        .then(([isPublic, maybeAccount]) => {
            let authorized = false;
            let invited = false;
            if (maybeAccount !== "Unauthorized") {
                const account: Account = maybeAccount;
                authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
            }
            logger.debug(`Application createEvaluator ${isPublic} ${authorized}  ${invited}`)

            if (isPublic || authorized || invited) {

                return this._evaluatorService.createEvaluator(sessionId, description, expression).then(() =>{})
            }
            return "Unauthorized";
        });    
    }

    updateEvaluator(sessionId: string, description: string, expression: string, token?: Token ): Promise<"Unauthorized" | void>  {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
        .then(([isPublic, maybeAccount]) => {
            let authorized = false;
            let invited = false;
            if (maybeAccount !== "Unauthorized") {
                const account: Account = maybeAccount;
                authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
            }
            if (isPublic || authorized || invited) {
                return this._evaluatorService.updateEvaluator(sessionId, description, expression).then(() =>{});
            } else {
                return "Unauthorized";
            }
        });        
    }

    getEvaluator(sessionId: string, token?: Token): Promise<Evaluator | undefined | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._evaluatorService.getEvaluator(sessionId)
                        .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });   
    }

    evaluateSequence(sessionId: string, actionList: Action[], token?: Token): Promise<Evaluation | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._evaluatorService.evaluate(sessionId, actionList)
                        .then((result) => result);
                } else {
                    return "Unauthorized";
                }
            });   
    }

    generateTests(sessionId: string, token?: Token): Promise<string | "Unauthorized"> {
        return Promise.all([this._accountService.isAuthorizationPublic(Kind.Session, sessionId), this.getAccount(token)])
            .then(([isPublic, maybeAccount]) => {
                let authorized = false;
                let invited = false;
                if (maybeAccount !== "Unauthorized") {
                    const account: Account = maybeAccount;
                    authorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    invited = account.receivedInvitationSet.some((invitation) => invitation.authorization.key === sessionId && invitation.authorization.kind === Kind.Session);
                }
                if (isPublic || authorized || invited) {
                    return this._generatorService.generateTest(sessionId)
                        .then((result) => {
                            if (result === undefined) {
                                return "Unauthorized";
                            } else {
                                return result;
                            }
                        });
                } else {
                    return "Unauthorized";
                }
            });   
    }

}