import fetch from "node-fetch";
import config from "./config";
import Session, { SessionOverlayType } from "../domain/Session";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import jsonwebtoken from "jsonwebtoken";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionServiceHTTP implements SessionService {

    findSessionIds(token: Token): Promise<string[] | "Unauthorized"> {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            return Promise.resolve(this.token2SessionIds(token));
        } catch(e) {
            return Promise.resolve("Unauthorized");
        }
    }

    findSessionById(token: Token, id: string): Promise<Session | "Unauthorized"> {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            const ids : string[] = this.token2SessionIds(token);
            if (ids.includes(id)) {
                const sessionGetURL = SESSION_URL + id;
                return fetch(sessionGetURL).then(response => {
                    if (response.ok) {
                        return response.json().then(sessionData => {
                            return new Session(sessionData.webSite, sessionData.baseURL, sessionData.id, sessionData.name, sessionData.useTestScenario);
                        })
                    } else {
                        throw new Error("Error:"+response.status)
                    }
                });
            } else {
                return Promise.resolve("Unauthorized");
            }
        } catch (e) {
            return Promise.resolve("Unauthorized");
        }
    }

    createSession(token: Token, webSiteId : string, baseURL: string, name: string, overlayType: SessionOverlayType): Promise<string> {
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


    addExploration(token: Token, sessionId: string, testerName: string, interactionList : Array<{index: number, concreteType: string, kind: string, value: string, date?: Date}>, startDate: Date, stopDate: Date) : Promise<number | "Unauthorized"> {
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



    private token2SessionIds(token : Token) : string[]{
        const payload : {username: string, authorizationSet: Object[]} = jsonwebtoken.verify(token.token, config.tokenSecret) as {username: string, authorizationSet: Object[]};
        return payload.authorizationSet.reduce<string[]>( (acc, currAuthorizationObject) => {
            const  authorization : {_kind: number, _key:string} = currAuthorizationObject as {_kind: number, _key:string};
            const SESSION_KIND = 1;
            if (authorization._kind === SESSION_KIND) {
                acc.push(authorization._key.split('$')[0]);
            }
            return acc;;
        }, []);
    }
  
}
