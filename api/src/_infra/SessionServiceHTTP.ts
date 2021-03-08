import fetch from "node-fetch";
import config from "../config";
import { HTTPResponseError } from "../domain/HTTPResponseError";
import Session from "../domain/Session";
import SessionService from "../domain/SessionService";


const URL: string = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionServiceHTTP implements SessionService {

    getSessionById(id: number): Promise<Session> {
        const sessionGetURL = URL + id
        return fetch(sessionGetURL).then(response => {
            if (response.ok) {
                    return response.json()
                } else {
                    throw new HTTPResponseError(response)
            }
        }).then(sessionData => {
            return new Session(
                sessionData.id,
                sessionData.baseURL,
                sessionData.webSite,
                sessionData.createdAt,
                sessionData.updatedAt,
                sessionData.useTestScenario,
                sessionData.overlayType)
        })
    }

    createSession(webSiteId: string, baseURL: string, name: string, overlayType: string, useTestScenario: boolean): Promise<string> {
        const sessionCreate = URL + "create";

        return fetch(sessionCreate, {
            method: 'POST',
            body:    JSON.stringify( {
            webSiteId,
            name,
            overlayType,
            useTestScenario,
            baseURL,
        }),
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            if (response.ok) {
                    return response.json()
                } else {
                    throw new HTTPResponseError(response)
            }
        })
        
    } 
  
}
