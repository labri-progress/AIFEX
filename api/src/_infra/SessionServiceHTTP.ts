import fetch from "node-fetch";
import config from "../config";
import Session from "../domain/Session";
import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import jsonwebtoken from "jsonwebtoken";

const SESSION_URL: string = `http://${config.session.host}:${config.session.port}/session/`;

const SECRET = "not really secret";

export default class SessionServiceHTTP implements SessionService {

    getSessionIds(token: Token): Promise<string[] | "Unauthorized"> {
        if (jsonwebtoken.verify(token.token, SECRET)) {
            return Promise.resolve(this.token2SessionIds(token));
        } else {
            return Promise.resolve("Unauthorized");
        }
    }

    getSessionById(token: Token, id: string): Promise<Session | "Unauthorized"> {
        if (jsonwebtoken.verify(token.token, SECRET)) {
            const ids : string[] = this.token2SessionIds(token);
            if (ids.includes(id)) {
                const sessionGetURL = SESSION_URL + id;
                return fetch(sessionGetURL).then(response => {
                    if (response.ok) {
                        return response.json().then(sessionData => {
                            return new Session(sessionData.webSite, sessionData.baseURL, sessionData.id, sessionData.name, sessionData.useTestScenario);
                        })
                    } else {
                        throw new Error(response)
                    }
                });
            } else {
                return Promise.resolve("Unauthorized");
            }
        } else {
            return Promise.resolve("Unauthorized");
        }
    }


    private token2SessionIds(token : Token) : string[]{
        const payload : {username: string, authorizationSet: Object[]} = jsonwebtoken.verify(token.token, SECRET) as {username: string, authorizationSet: Object[]};
        return payload.authorizationSet.reduce<string[]>( (acc, currAuthorizationObject) => {
            const  authorization : {_kind: number, _key:string} = currAuthorizationObject as {_kind: number, _key:string};
            const SESSION_KIND = 1;
            if (authorization._kind === SESSION_KIND) {
                acc.push(authorization._key);
            }
            return acc;;
        }, []);
    }
  
}
