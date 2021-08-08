import Session, { SessionOverlayType } from "../domain/Session";
import AccountService from "../domain/AccountService";
import Mapping from "../domain/Mapping";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import Account from "../domain/Account";
import Screenshot from "../domain/Screenshot";
import { Kind } from "../domain/Kind";
import Interaction from "../domain/Interaction";
import Model from "../domain/Model";
import ModelService from "../domain/ModelService";
import { ModelPredictionType } from "../domain/ModelPredictionType";
import Video from "../domain/Video";
import CommentDistribution from "../domain/CommentDistribution";
import Ngram from "../domain/Ngram";

export default class APIApplication {
    private _accountService: AccountService;
    private _webSiteService: WebSiteService;
    private _sessionService: SessionService;
    private _modelService: ModelService;

    constructor(accountService: AccountService, webSiteService: WebSiteService, sessionService: SessionService, modelService: ModelService) {
        this._accountService = accountService;
        this._webSiteService = webSiteService;
        this._sessionService = sessionService;
        this._modelService = modelService;
    }

    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated"> {
        return this._accountService.signup(username, email, password);
    }

    signin(username: string, password: string): Promise<Token | "Unauthorized"> {
        return this._accountService.signin(username, password);
    }

    getAccount(token: Token): Promise<Account | "Unauthorized"> {
        return this._accountService.getAccount(token);
    }

    createWebSite(token: Token, name: string, url: string, mappingList: Mapping[]): Promise<WebSite | "Unauthorized"> {
        return this._webSiteService.createWebSite(name, url, mappingList)
            .then((webSiteId) => {
                return this._accountService.addWebSite(token, webSiteId)
                    .then((addResult) => {
                        if (addResult === "Unauthorized") {
                            return "Unauthorized";
                        } else {
                            return new WebSite(webSiteId, name, url, mappingList);
                        }
                    });
            });
    }

    updateWebSite(token: Token, webSiteId: string, name: string, url: string, mappingList: Mapping[]): Promise<"Unauthorized" | "WebSiteUpdated"> {
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
                        return this._webSiteService.updateWebSite(webSiteId, name, url, mappingList)
                            .then((result) => result);
                    }
                }
            });
    }


    removeWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteRemoved"> {
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
                        return this._accountService.removeWebSite(token, webSiteId)
                            .then((result) => result);
                    }
                }
            });
    }

    findWebSiteById(token: Token, webSiteId: string): Promise<WebSite | undefined | "Unauthorized"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === webSiteId && authorization.kind === Kind.WebSite);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._webSiteService.findWebSiteById(webSiteId).then((result) => result);
                    }
                }
            });
    }

    createSession(token: Token, webSiteId: string, baseURL: string, name: string, overlayType: SessionOverlayType): Promise<Session | "Unauthorized"> {
        return this.findWebSiteById(token, webSiteId)
            .then((findResult) => {
                if (findResult === undefined || findResult === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const webSite: WebSite = findResult;
                    return this._sessionService.createSession(webSiteId, baseURL, name, overlayType)
                        .then((sessionId) => {
                            return this._accountService.addSession(token, sessionId)
                                .then((addSessionResult) => {
                                    if (addSessionResult === "Unauthorized") {
                                        return "Unauthorized";
                                    } else {
                                        return new Session(sessionId, name, baseURL, webSite, new Date(), new Date(), false, overlayType, []);
                                    }
                                })
                        });
                }
            })
    }

    removeSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionRemoved"> {
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
                        return this._accountService.removeSession(token, sessionId)
                            .then((result) => result);
                    }
                }
            });
    }

    findSessionById(token: Token, sessionId: string): Promise<Session | undefined | "Unauthorized"> {
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
                        return this._sessionService.findSessionById(sessionId).then((result) => result);
                    }
                }
            });
    }

    addExploration(token: Token, sessionId: string, testerName: string, interactionList: Interaction[], startDate?: Date, stopDate?: Date): Promise<"Unauthorized" | number> {
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
                        return this._sessionService.addExploration(sessionId, testerName, interactionList, startDate, stopDate)
                            .then((result) => result);
                    }
                }
            });

    }

    addScreenshots(token: Token, sessionId: string, screenshots: Screenshot[]): Promise<"Unauthorized" | "InvalidScreenshots" | "ScreenshotsAdded"> {
        if (screenshots.some(screenshot => screenshot.sessionId !== sessionId)) {
            return Promise.resolve("InvalidScreenshots");
        } else {
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
                            return this._sessionService.addScreenshots(screenshots);
                        }
                    }
                });
        }
    }

    findScreenshotsBySessionId(token: Token, sessionId: string): Promise<Screenshot[] | "Unauthorized"> {
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
                        return this._sessionService.findScreenshotsBySessionId(sessionId).then(result => result);
                    }
                }
            });
    }

    addVideo(token: Token, video: Video): Promise<"Unauthorized" | "InvalidVideo" | "VideoAdded"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const authorized = account.authorizationSet.some((authorization) => authorization.key === video.sessionId && authorization.kind === Kind.Session);
                    if (!authorized) {
                        return "Unauthorized";
                    } else {
                        return this._sessionService.addVideo(video);
                    }
                }
            });
    }


    createModel(token: Token, depth: number, interpolationfactor: number, predictionType : ModelPredictionType) : Promise<Model | "Unauthorized"> {
        return this._modelService.createModel(depth, interpolationfactor, predictionType)
            .then((modelId) => {
                return this._accountService.addModel(token, modelId)
                    .then((addResult) => {
                        if (addResult === "Unauthorized") {
                            return "Unauthorized";
                        } else {
                            return new Model(modelId, depth, interpolationfactor, predictionType, []);
                        }
                    });
            });
    }

    removeModel(token: Token, modelId: string): Promise<"Unauthorized" | "ModelRemoved"> {
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
                        return this._accountService.removeModel(token, modelId)
                            .then((result) => result);
                    }
                }
            });
    }

    findModelById(token: Token, modelId: string): Promise<Model | undefined | "Unauthorized"> {
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
                        return this._modelService.findModelById(modelId).then((result) => result);
                    }
                }
            });
    }

    linkModelToSession(token: Token, modelId: string, sessionId: string): Promise<"Unauthorized" | "ModelLinkedToSession" | "ModelIsUnknown"> {
        return this.getAccount(token)
            .then((result) => {
                if (result === "Unauthorized") {
                    return "Unauthorized";
                } else {
                    const account: Account = result;
                    const modelAuthorized = account.authorizationSet.some((authorization) => authorization.key === modelId && authorization.kind === Kind.Model);
                    const sessionAuthorized = account.authorizationSet.some((authorization) => authorization.key === sessionId && authorization.kind === Kind.Session);
                    if (!modelAuthorized || !sessionAuthorized) {
                        return "Unauthorized";
                    } else {
                        return this._modelService.linkModelToSession(modelId, sessionId)
                            .then((result) => result);
                    }
                }
            });
    }

    computeProbabilities(token: Token, modelId: string, interactionList: Interaction[]): Promise<"Unauthorized" | Map<string,number>> {
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
                        return this._modelService.computeProbabilities(modelId, interactionList)
                            .then((result) => result);
                    }
                }
            });
    }

    getCommentDistributions(token: Token, modelId: string, interactionList: Interaction[]): Promise<"Unauthorized" | Map<string,CommentDistribution[]>> {
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
                        return this._modelService.getCommentDistributions(modelId, interactionList)
                            .then((result) => result);
                    }
                }
            });
    }

    getAllNgram(token: Token, modelId: string): Promise<"Unauthorized" | Ngram[]> {
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
                        return this._modelService.getAllNgram(modelId)
                            .then((result) => result);
                    }
                }
            });
    }

}