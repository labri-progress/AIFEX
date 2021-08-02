import Action from "../domain/Action";
import ActionInteraction from "../domain/ActionInteraction";
import Answer from "../domain/Answer";
import AnswerInteraction from "../domain/AnswerInteraction";
import Comment from "../domain/Comment";
import CommentInteraction from "../domain/CommentInteraction";
import Exploration from "../domain/Exploration";
import Interaction from "../domain/Interaction";
import Screenshot from "../domain/Screenshot";
import ScreenshotRepository from "../domain/ScreenshotRepository";
import Session, { SessionOverlayType } from "../domain/Session";
import SessionRepository from "../domain/SessionRepository";
import Tester from "../domain/Tester";
import Video from "../domain/Video";
import VideoRepository from "../domain/VideoRepository";
import WebSiteRepository from "../domain/WebSiteRepository";
import EventStore from "./EventStore";

const CACHE_SIZE: number = 5;

export default class SessionService {
    private readonly sessionRepository: SessionRepository;
    private readonly webSiteRepository: WebSiteRepository;
    private readonly eventStore: EventStore;
    private readonly screenshotRepository: ScreenshotRepository;
    private readonly videoRepository: VideoRepository;

    private mountedSessionList: Session[];

    constructor(sessionRepository: SessionRepository,
        webSiteRepository: WebSiteRepository,
        eventStore: EventStore,
        screenshotRepository: ScreenshotRepository,
        videoRepository: VideoRepository) {

        this.sessionRepository = sessionRepository;
        this.webSiteRepository = webSiteRepository;
        this.eventStore = eventStore;
        this.screenshotRepository = screenshotRepository;
        this.videoRepository = videoRepository;
        this.mountedSessionList = [];
    }

    public createNewSessionForWebSiteId(webSiteId: string, baseURL: string, name: string, useTestScenario: boolean, overlayType: SessionOverlayType): Promise<string | undefined> {

        return this.webSiteRepository.findWebSiteById(webSiteId)
            .then((webSite) => {
                if (webSite !== undefined) {
                    const session: Session = new Session(webSite, baseURL, undefined, name, useTestScenario, undefined, undefined, overlayType);
                    this.addSessionInCache(session);
                    return this.sessionRepository.addSession(session)
                        .then((newSessionId) => {
                            return newSessionId;
                        });
                } else {
                    return undefined;
                }
            });
    }

    public mountSession(sessionId: string): Promise<Session | undefined> {
        const sessionInCache: Session | undefined = this.mountedSessionList.find((session) => session.id === sessionId);
        if (sessionInCache) {
            return Promise.resolve(sessionInCache);
        }

        return this.sessionRepository.findSessionById(sessionId)
            .then((foundSession) => {
                if (foundSession !== undefined) {
                    this.addSessionInCache(foundSession);
                }
                return foundSession;
            });
    }

    public addSessionInCache(session: Session): void {
        if (this.mountedSessionList.length >= CACHE_SIZE) {
            this.mountedSessionList.shift();
        }
        this.mountedSessionList[this.mountedSessionList.length] = session;
    }

    public startExploration(sessionId: string, testerName: string, startDate?: Date): Promise<number> {
        let explorationNumber: number;
        let session: Session;
        return this.mountSession(sessionId)
            .then((mountSession) => {
                if (mountSession) {
                    session = mountSession;
                    if (testerName === undefined) {
                        testerName = "anonymous";
                    }
                    if (startDate === undefined) {
                        startDate = new Date();
                    }
                    const tester: Tester = new Tester(testerName);
                    explorationNumber = session.startExploration(tester, startDate);
                    return this.sessionRepository.addExploration(sessionId, explorationNumber, tester, startDate)
                        .then(() => {
                            return explorationNumber
                        });
                } else {
                    throw new Error('wrong sessionId');
                }
            })
    }

    public stopExploration(sessionId: string, explorationNumber: number, stopDate?: Date): Promise<void> {
        return this.mountSession(sessionId)
            .then((session) => {
                if (session) {
                    session.stopExploration(explorationNumber);
                    if (stopDate === undefined) {
                        stopDate = new Date();
                    }
                    return this.sessionRepository.updateExplorationIsStopped(sessionId, explorationNumber, stopDate);
                } else {
                    throw new Error('wrong sessionId');
                }

            });
    }

    public addExploration(sessionId: string,
        testerName: string | undefined,
        interactionListData: Array<{ index: number, concreteType: string, kind: string, value: string, date?: Date }>,
        startDate?: Date,
        stopDate?: Date
    ): Promise<number> {
        let explorationNumber: number;
        let session: Session;
        let tester: Tester;

        if (testerName) {
            tester = new Tester(testerName);
        } else {
            tester = new Tester("anonymous");
        }
        let explorationStartDate: Date;
        if (startDate === undefined) {
            explorationStartDate = new Date();
        } else {
            explorationStartDate = startDate;
        }
        let explorationStopDate: Date;
        if (stopDate === undefined) {
            explorationStopDate = new Date();
        } else {
            explorationStopDate = stopDate;
        }
        return this.mountSession(sessionId)
            .then((mountSession) => {
                if (mountSession) {
                    session = mountSession;

                    explorationNumber = session.startExploration(tester, explorationStartDate);
                    if (interactionListData) {
                        const interactionList: Interaction[] = [];
                        interactionListData
                            .sort((interA, interB) => interA.index - interB.index)
                            .forEach((interaction) => {
                                if (interaction.concreteType === "Action") {
                                    interactionList.push(new ActionInteraction(interaction.index, new Action(interaction.kind, interaction.value), interaction.date));
                                }
                                if (interaction.concreteType === "Comment") {
                                    interactionList.push(new CommentInteraction(interaction.index, new Comment(interaction.kind, interaction.value), interaction.date));
                                }
                                if (interaction.concreteType === "Answer") {
                                    interactionList.push(new AnswerInteraction(interaction.index, new Answer(interaction.kind, interaction.value), interaction.date));
                                }
                            });
                        session.addInteractionListToExploration(explorationNumber, interactionList);
                    }

                    session.stopExploration(explorationNumber, stopDate);

                    if (this.eventStore) {
                        this.eventStore.notifySessionExploration(sessionId, session.explorationList[explorationNumber]);
                    }

                    return this.sessionRepository.addExploration(sessionId, explorationNumber, tester, explorationStartDate)
                        .then(() => {
                            const interactionList = session.explorationList[explorationNumber].interactionList;
                            return this.sessionRepository.updateInteractionListOfExploration(sessionId, explorationNumber, interactionList);
                        })
                        .then(() => {
                            return this.sessionRepository.updateExplorationIsStopped(sessionId, explorationNumber, explorationStopDate);
                        })
                        .then(() => {
                            return explorationNumber;
                        });
                } else {
                    throw new Error('wrong session id');
                }
            })
    }

    public addScreenshot(sessionId: string, explorationNumber: number, interactionIndex: number, image: string): Promise<string> {
        return this.screenshotRepository.findScreenshot(sessionId, explorationNumber, interactionIndex)
            .then((screenshotId) => {
                if (screenshotId === undefined) {
                    const screenshot = new Screenshot(sessionId, explorationNumber, interactionIndex, image);
                    return this.screenshotRepository.addScreenshot(screenshot);
                } else {
                    return Promise.resolve(screenshotId);
                }
            });
    }

    public getNumberOfExplorationForTester(sessionId: string, testerName: string): Promise<number> {
        return this.mountSession(sessionId)
            .then((session) => {
                if (session === undefined) {
                    throw new Error('wrong session id');
                }
                let numberOfExplorationForTester = session.explorationList.filter((exploration: Exploration) => {
                    return exploration.tester.name === testerName
                }).length;

                return numberOfExplorationForTester;
            })
    }

    public findScreenshotBySession(sessionId: string): Promise<Array<{ explorationNumber: number, interactionIndex: number }> | undefined> {
        return this.screenshotRepository.findScreenshotBySession(sessionId);
    }

    public addVideo(sessionId: string, explorationNumber: number, videoBuffer: Buffer): Promise<void> {
        return this.videoRepository.findVideo(sessionId, explorationNumber)
            .then((video: Video | undefined) => {
                if (video === undefined) {
                    const videoObj: Video = new Video(sessionId, explorationNumber, videoBuffer);
                    return this.videoRepository.addVideo(videoObj);
                } else {
                    return Promise.resolve();
                }
            });
    }

    public findVideoBySession(sessionId: string): Promise<Array<{ explorationNumber: number }> | undefined> {
        return this.videoRepository.findVideoBySession(sessionId);
    }
}
