import fetch from "node-fetch";
import config from "../config";
import { HTTPResponseError } from "../domain/HTTPResponseError";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";

const URL: string = `http://${config.website.host}:${config.website.port}/website/`;

export default class WebSiteServiceHTTP implements WebSiteService {
    
    getWebSiteById(id: string): Promise<WebSite> {
        const webSiteGetURL = URL + id
        return fetch(webSiteGetURL).then(response => {
            if (response.ok) {
                    return response.json()
                } else {
                    throw new HTTPResponseError(response)
            }
        }).then(webSiteData => {
            return new WebSite(webSiteData.id, webSiteData.name, webSiteData.url, webSiteData.mappingList);
        })
    }
    
    createWebSite(name: string, url: string, mappingList: any): Promise<string> {

        let optionWebSiteCreate = {
            method: 'POST',
            body:    JSON.stringify({
                name,
                url,
                mappingList
        }),
            headers: { 'Content-Type': 'application/json' },
        }
        const webSiteCreateURL = URL + 'create';

        return fetch(webSiteCreateURL, optionWebSiteCreate)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new HTTPResponseError(response)
                }
            }).then(webSiteId => {
                return webSiteId;
            })
    }

    updateWebSite(id: string, name: string, url: string, mappingList: any): Promise<void> {
        const webSiteUpdateURL = URL + 'update';
        let optionWebSiteCreate = {
            method: 'POST',
            body:    JSON.stringify({
            id,
            name,
            url,
            mappingList
        }),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(webSiteUpdateURL, optionWebSiteCreate)
            .then(response => {
                if (response.ok) {
                    return id;
                } else {
                    throw new HTTPResponseError(response)
                }
            })
    }
    public webSiteName: string;

    public findWebSiteById(id: string): Promise<WebSite> {
        const route: string = URL + id;
        return fetch(route)
        .then( (response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject("findWebSite REST error");
            }
        })
        .then( (resWebSite) => {
            return new WebSite(resWebSite.id, resWebSite.name, resWebSite.url);
        });
    }

}
