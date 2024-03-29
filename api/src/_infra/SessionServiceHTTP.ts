import config from "./config";
import Session from "../domain/Session";
import SessionService from "../domain/SessionService";
import Screenshot from "../domain/Screenshot";
import Interaction from "../domain/Action";
import Video from "../domain/Video";
import fetch from "node-fetch";
import { SessionOverlayType } from "../domain/SessionOverlayType";
import { RecordingMode } from "../domain/RecordingMode";
import FormData from "form-data";
import { logger } from "../logger";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

const SUCCESS_STATUS = 200;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;


export default class SessionServiceHTTP implements SessionService {

    ping() {
        const route: string = SESSION_URL + "ping";
        return fetch(route)
            .then( (response) => {
                return response.ok;
            })
    }
    
    findSessionById(id: string): Promise<Session | undefined > {
        const sessionGetURL = SESSION_URL + id;
        return fetch(sessionGetURL).then(response => {
            if (response.ok) {
                return response.json().then(sesRes => {
                    return new Session(sesRes.id, sesRes.baseURL, sesRes.webSite, sesRes.name, sesRes.description,  sesRes.createdAt, sesRes.overlayType, sesRes.recordingMode, sesRes.explorationList);
                })
            } else {
                return undefined;
            }
        });
    
    }

    createSession(webSiteId : string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<string> {
        let session = {
            webSiteId,
            baseURL,
            name,
            description,
            overlayType : overlayType.toString(),
            recordingMode : recordingMode.toString()
        }
        const SessionCreateURL = 'http://' + config.session.host + ':' + config.session.port + '/session/create';
        let optionSessionCreate = {
            method: 'POST',
            body:    JSON.stringify(session),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(SessionCreateURL, optionSessionCreate)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }

    updateSession(sessionId: string, webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<Session> {
        let session = {
            sessionId,
            webSiteId,
            baseURL,
            name,
            description,
            overlayType : overlayType.toString(),
            recordingMode : recordingMode.toString()
        }
        const SessionUpdateURL = 'http://' + config.session.host + ':' + config.session.port + '/session/update';
        let optionSessionUpdate = {
            method: 'POST',
            body:    JSON.stringify(session),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(SessionUpdateURL, optionSessionUpdate)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })

    }


    addExploration(sessionId: string, testerName: string, interactionList : Interaction[], startDate?: Date, stopDate?: Date) : Promise<number> {
        let exploration = {
            testerName,
            interactionList,
            startDate,
            stopDate
        }
        const AddExplorationURL = `http://${config.session.host}:${config.session.port}/session/${sessionId}/exploration/add`;
        let optionAddExploration = {
            method: 'POST',
            body:    JSON.stringify(exploration),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(AddExplorationURL, optionAddExploration)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }

    removeExploration(sessionId: string, explorationId: number): Promise<"ExplorationRemoved" | "ExplorationNotFound"> {
        const RemoveExplorationURL = `http://${config.session.host}:${config.session.port}/session/${sessionId}/exploration/${explorationId}/remove`;
        let optionRemoveExploration = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(RemoveExplorationURL, optionRemoveExploration)
            .then(response => {
                if (response.ok) {
                    return "ExplorationRemoved";
                } else if (response.status === NOT_FOUND_STATUS) {
                    return "ExplorationNotFound";
                }
                else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }

    addInteractions(sessionId: string, explorationNumber: number, interactionList: Interaction[]): Promise<"InteractionsAdded" | "ExplorationNotFound"> {
        const AddInteractionsURL = `http://${config.session.host}:${config.session.port}/session/${sessionId}/exploration/${explorationNumber}/pushActionList`;
        let optionAddInteractions = {
            method: 'POST',
            body:    JSON.stringify({interactionList}),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(AddInteractionsURL, optionAddInteractions)
            .then(response => {
                if (response.ok) {
                    return "InteractionsAdded";
                } else {
                    throw new Error("Error" + response.statusText);
                }
            })
    }

    addScreenshots(screenshots: Screenshot[]): Promise<"ScreenshotsAdded"> {
        const AddScreenshotsURL = `http://${config.session.host}:${config.session.port}/session/addscreenshotlist`;
        let optionAddScreenshots = {
            method: 'POST',
            body:    JSON.stringify({screenshotList:screenshots}),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(AddScreenshotsURL, optionAddScreenshots)
            .then(response => {
                if (response.ok) {
                    return "ScreenshotsAdded"
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }

    findScreenshotsBySessionId(sessionId: string): Promise<Screenshot[]> {
        const GetScreenshotsURL = `http://${config.session.host}:${config.session.port}/session/${sessionId}/screenshotlist`;
        return fetch(GetScreenshotsURL)
            .then(response => {
                if (response.ok) {
                    return response.json().then(json => json.screenshotList);
                } else {
                    return [];
                }
            })
    }

    addVideo(video: Video): Promise<"VideoAdded"> {
        const AddVideoURL = `http://${config.session.host}:${config.session.port}/session/addvideo/${video.sessionId}/${video.explorationNumber}`;
        const formData = new FormData();
        logger.debug('video length:'+ video.buffer.length);
        formData.append('video', video.buffer, {filename: video.sessionId+'_'+video.explorationNumber+'.mp4'});
        let optionAddVideo = {
            method: 'POST',
            body: formData,
        }
        return fetch(AddVideoURL, optionAddVideo)
            .then(response => {
                if (response.ok) {
                    return "VideoAdded"
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }

    findExplorationsWithVideo(sessionId: string): Promise<number[]> {
        const GetVideosURL = `http://${config.session.host}:${config.session.port}/session/${sessionId}/videolist`;
        return fetch(GetVideosURL)
            .then(response => {
                if (response.ok) {
                    return response.json()
                        .then((json) => {
                            return json.videoList.map((video : any) => parseInt(video.explorationNumber));
                        });
                } else {
                    return [];
                }
            })
    }

}
