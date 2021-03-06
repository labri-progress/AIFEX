import fetch from "node-fetch";
import config from "./config";
import Session from "../domain/Session";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import jsonwebtoken from "jsonwebtoken";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionServiceHTTP implements SessionService {

    getSessionIds(token: Token): Promise<string[] | "Unauthorized"> {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            return Promise.resolve(this.token2SessionIds(token));
        } catch(e) {
            return Promise.resolve("Unauthorized");
        }
    }

    getSessionById(token: Token, id: string): Promise<Session | "Unauthorized"> {
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
