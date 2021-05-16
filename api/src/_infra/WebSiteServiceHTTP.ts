import fetch from "node-fetch";
import config from "./config";
import Token from "../domain/Token";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import jsonwebtoken from "jsonwebtoken";
import Mapping from "../domain/Mapping";

const WEBSITE_URL : string = `http://${config.website.host}:${config.website.port}/website/`;

export default class WebSiteServiceHTTP implements WebSiteService {
    
    getWebSiteIds(token: Token): Promise<string[] | "Unauthorized"> {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            return Promise.resolve(this.token2WebSiteIds(token));
        } catch (e) {
            return Promise.resolve("Unauthorized");
        }
    }
    
    getWebSiteById(token : Token, id: string): Promise<WebSite | "Unauthorized"> {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            const ids : string[] = this.token2WebSiteIds(token);
            if (ids.includes(id)) {
                const webSiteGetURL = WEBSITE_URL + id;
                return fetch(webSiteGetURL).then(response => {
                    if (response.ok) {
                        return response.json().then(webSiteData => {
                            return new WebSite(webSiteData.id, webSiteData.name, webSiteData.url, webSiteData.mappingList);
                        })
                    } else {
                        throw new Error("Error:"+response.status)
                    }
                });
            } else {
                return Promise.resolve("Unauthorized");
            }
        } catch(e) {
            return Promise.resolve("Unauthorized");
        }
    }

    createWebSite(token: Token, name: string, url: string, mappingList: Mapping[]): Promise<string | "Unauthorized" > {
        let webSite = {
            name,
            url,
            mappingList
        }
        const webSiteCreateURL = 'http://' + config.website.host + ':' + config.website.port + '/website/create';
        let optionWebSiteCreate = {
            method: 'POST',
            body:    JSON.stringify(webSite),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(webSiteCreateURL, optionWebSiteCreate)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
            
    }


    private token2WebSiteIds(token : Token) : string[]{
        const payload : {username: string, authorizationSet: Object[]} = jsonwebtoken.verify(token.token, config.tokenSecret) as {username: string, authorizationSet: Object[]};
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
