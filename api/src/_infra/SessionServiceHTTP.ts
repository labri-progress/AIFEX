import fetch from "node-fetch";
import config from "./config";
import Session, { SessionOverlayType } from "../domain/Session";
import SessionService from "../domain/SessionService";
import Screenshot from "../domain/Screenshot";
import Interaction from "../domain/Interaction";
import Video from "../domain/Video";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionServiceHTTP implements SessionService {
    
    findSessionById(id: string): Promise<Session | undefined > {
        const sessionGetURL = SESSION_URL + id;
        return fetch(sessionGetURL).then(response => {
            if (response.ok) {
                return response.json().then(sesRes => {
                    return new Session(sesRes.id, sesRes.name, sesRes.baseURL, sesRes.webSite, sesRes.createdAt, sesRes.updatedAt, sesRes.useTestScenario, sesRes.overlayType, sesRes.explorationList);
                })
            } else {
                return undefined;
            }
        });
    
    }

    createSession(webSiteId : string, baseURL: string, name: string, overlayType: SessionOverlayType): Promise<string> {
        let session = {
            webSiteId,
            baseURL,
            name,
            overlayType : overlayType.toString(),
            useTestScenario : false
        }
        const SessionCreateURL = 'http://' + config.session.host + ':' + config.session.port + '/session/create';
        let optionSessionCreate = {
            method: 'POST',
            body:    JSON.stringify(session),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(SessionCreateURL, optionSessionCreate)
            .then(response => {
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
