import Action from "../domain/Action";
import ActionInteraction from "../domain/ActionInteraction";
import AnswerInteraction from "../domain/AnswerInteraction";
import Comment from "../domain/Comment";
import CommentInteraction from "../domain/CommentInteraction";
import Interaction from "../domain/Interaction";
import { RecordingMode } from "../domain/RecordingMode";
import Session from "../domain/Session";
import { SessionOverlayType } from "../domain/SessionOverlyaType";
import SessionRepository from "../domain/SessionRepository";
import Tester from "../domain/Tester";
import WebSiteRepository from "../domain/WebSiteRepository";
import ExplorationSchema, { ExplorationDocument } from "./ExplorationSchema";
import SessionSchema, { SessionDocument } from "./SessionSchema";

export default class SessionRepositoryMongo implements SessionRepository {

    private _webSiteRepository: WebSiteRepository;

    constructor(webSiteRepository : WebSiteRepository) {
        this._webSiteRepository = webSiteRepository;
    }

    public addSession(session: Session): Promise<string> {
        return SessionSchema.create({
            _id: session.id,
            webSiteId: session.webSite.id,
            baseURL: session.baseURL,
            name: session.name,
            description: session.description,
            createdAt: session.createdAt,
            overlayType: session.overlayType,
            recordingMode: session.recordingMode
        })
        .then( () => {
            return session.id;
        });
    }
    updateSession(sessionId: string, name: string, webSiteId: string, baseURL: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<void> {
        return SessionSchema.updateOne({_id: sessionId}, {$set: {name, webSiteId, baseURL, description, overlayType, recordingMode}})
        .exec().then(() => {});
    }
    

    changeDescription(sessionId: string, description: string): Promise<void> {
        return SessionSchema.updateOne({_id: sessionId}, {$set: {description}})
        .exec().then(() => {});
    }

    changeName(sessionId: string, name: string): Promise<void> {
        return SessionSchema.updateOne({_id: sessionId}, {$set: {name}})
        .exec().then(() => {});
    }


    public addExploration(sessionId: string, explorationNumber: number, tester: Tester, startDate: Date): Promise<number> {
        return ExplorationSchema.create({
            sessionId,
            explorationNumber,
            testerName: tester.name,
            isStopped: false,
            interactionList : [],
            startDate
        }).
        then( () => {
            return explorationNumber;
        });
    }

    public updateInteractionListOfExploration(sessionId: string, explorationNumber: number, updatedInteractionList: Interaction[]): Promise<void> {
        const isInteraction = (interaction: {
            concreteType: string,
            index: number,
            kind: string,
            value: string | undefined,
            date: Date
        } | undefined): interaction is {
            concreteType: string,
            index: number,
            kind: string,
            value: string | undefined,
            date: Date
        } => {
            return !!interaction
          }

        const interactionList :  any[] = updatedInteractionList.map( (interaction) => {
            if (interaction instanceof ActionInteraction) {
                return {
                    concreteType: "Action",
                    index: interaction.index,
                    kind: interaction.action.prefix,
                    value: interaction.action.suffix,
                    date: interaction.date
                };
            }
            if (interaction instanceof CommentInteraction) {
                return {
                    concreteType: "Comment",
                    index: interaction.index,
                    kind: interaction.comment.kind,
                    value: interaction.comment.value,
                    date: interaction.date
                };
            }
            if (interaction instanceof AnswerInteraction) {
                return {
                    concreteType: "Answer",
                    index: interaction.index,
                    kind: interaction.answer.kind,
                    value: interaction.answer.value,
                    date: interaction.date
                };
            }
        }).filter(isInteraction);

        return ExplorationSchema.updateOne({ sessionId, explorationNumber },{$set: {interactionList}})
        .exec().then(() => {});
    }

    public updateExplorationIsStopped(sessionId: string, explorationNumber: number, stopDate: Date): Promise<void> {
        return ExplorationSchema.updateOne({sessionId, explorationNumber},
            {
                $set : {
                    isStopped: false,
                    stopDate
                },
            })
            .exec().then(() => {});
    }

    public setSubmissionAttempt(sessionId: string, explorationNumber: number, submissionAttempt: number): Promise<void> {
        return ExplorationSchema.updateOne({sessionId, explorationNumber},
            {
                $set : {
                    submissionAttempt
                },
            })
            .exec().then(() => {});
    }

    public findSessionById(sessionId: string): Promise<Session | undefined> {
        let id: string;
        let baseURL: string;
        let name: string;
        let description: string;
        let session: Session;
        let createdAt: Date;
        let overlayType: SessionOverlayType;
        let recordingMode: RecordingMode;
        
        return SessionSchema.findOne({_id: sessionId}).exec()
        .then((sessionData: SessionDocument | null) => {
            if (sessionData !== null) {    
                id = sessionData._id;
                baseURL = sessionData.baseURL;
                name = sessionData.name;
                description = sessionData.description;
                createdAt = sessionData.createdAt;

                if (sessionData.overlayType === "shadow" || sessionData.overlayType === "bluesky" || sessionData.overlayType === "rainbow") {
                    overlayType = sessionData.overlayType;
                } else {
                    overlayType = "rainbow";
                }
                if (sessionData.recordingMode === "byexploration" || sessionData.recordingMode === "byinteraction") {
                    recordingMode = sessionData.recordingMode;
                } else {
                    recordingMode = "byexploration";
                }
                
                return this._webSiteRepository.findWebSiteById(sessionData.webSiteId)
                .then((webSite) => {
                    if (webSite !== undefined) {
                        session = new Session(id, webSite, baseURL, name, description, createdAt, overlayType, recordingMode);
                        return ExplorationSchema.find({sessionId: session.id})
                        .then((explorationDataList) => {
                            explorationDataList
                            .sort( (explA, explB) => explA.explorationNumber - explB.explorationNumber)
                            .forEach((explorationData: ExplorationDocument) => {
                                const tester: Tester = new Tester(explorationData.testerName);
                                const explorationNumber: number = session.startExploration(tester);
                                const interactionList : Interaction[] = [];
                                explorationData.interactionList
                                .filter((inter) => inter !== null && inter !== undefined)
                                .sort( (interA, interB) => interA.index - interB.index)
                                .forEach((interactionData) => {
                                    if (interactionData.concreteType === "Action") {
                                        interactionList.push(new ActionInteraction(interactionData.index, new Action(interactionData.kind, interactionData.value), interactionData.date));
                                    }
                                    if (interactionData.concreteType === "Comment") {
                                        let comment: Comment;
                                        if (interactionData.value !== undefined) {
                                            comment = new Comment(interactionData.kind, interactionData.value)
                                        } else {
                                            comment = new Comment(interactionData.kind, "");
                                        }
                                        interactionList.push(new CommentInteraction(interactionData.index, comment, interactionData.date));
                                    }
                                });
                                session.addInteractionListToExploration(explorationNumber, interactionList);
                            });
                            return session;
                        });
                    }
                }) 
            }
        })
    }

}
