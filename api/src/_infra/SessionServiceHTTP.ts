import config from "./config";
import Session from "../domain/Session";
import SessionService from "../domain/SessionService";
import Screenshot from "../domain/Screenshot";
import Interaction from "../domain/Action";
import Video from "../domain/Video";
import fetch from "node-fetch";
import { SessionOverlayType } from "../domain/SessionOverlayType";
import { RecordingMode } from "../domain/RecordingMode";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

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
                    return new Session(sesRes.id, sesRes.baseURL, sesRes.webSite, sesRes.name, sesRes.desription,  sesRes.createdAt, sesRes.overlayType, sesRes.recordingMode, sesRes.explorationList);
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
        throw new Error("Method not implemented.");
    }

    findVideosBySessionId(sessionId: string): Promise<Video[]> {
        throw new Error("Method not implemented.");
    }

}
