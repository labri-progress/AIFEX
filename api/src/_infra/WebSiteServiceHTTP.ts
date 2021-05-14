import fetch from "node-fetch";
import config from "./config";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import jsonwebtoken from "jsonwebtoken";

const WEBSITE_URL : string = `http://${config.website.host}:${config.website.port}/website/`;


const SECRET = "not really secret";

export default class WebSiteServiceHTTP implements WebSiteService {
    
    getWebSiteIds(token: Token): Promise<string[] | "Unauthorized"> {
        if (jsonwebtoken.verify(token.token, SECRET)) {
            return Promise.resolve(this.token2WebSiteIds(token));
        } else {
            return Promise.resolve("Unauthorized");
        }
    }
    
    getWebSiteById(token : Token, id: string): Promise<WebSite | "Unauthorized"> {
        if (jsonwebtoken.verify(token.token, SECRET)) {
            const ids : string[] = this.token2WebSiteIds(token);
            if (ids.includes(id)) {
                const webSiteGetURL = WEBSITE_URL + id;
                return fetch(webSiteGetURL).then(response => {
                    if (response.ok) {
                        return response.json().then(webSiteData => {
                            return new WebSite(webSiteData.id, webSiteData.name, webSiteData.url, webSiteData.mappingList);
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


    private token2WebSiteIds(token : Token) : string[]{
        const payload : {username: string, authorizationSet: Object[]} = jsonwebtoken.verify(token.token, SECRET) as {username: string, authorizationSet: Object[]};
        return payload.authorizationSet.reduce<string[]>( (acc, currAuthorizationObject) => {
            const  authorization : {_kind: number, _key:string} = currAuthorizationObject as {_kind: number, _key:string};
            const WEBSITE_KIND = 2;
            if (authorization._kind === WEBSITE_KIND) {
                acc.push(authorization._key);
            }
            return acc;;
        }, []);
    }
    
    
}
