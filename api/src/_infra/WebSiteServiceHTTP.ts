import fetch from "node-fetch";
import config from "./config";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";
import Mapping from "../domain/Mapping";

const WEBSITE_URL : string = `http://${config.website.host}:${config.website.port}/website/`;

export default class WebSiteServiceHTTP implements WebSiteService {
        
    findWebSiteById(id: string): Promise<WebSite | undefined> {
        const webSiteGetURL = WEBSITE_URL + id;
        return fetch(webSiteGetURL).then(response => {
            if (response.ok) {
                return response.json().then(webSiteData => {
                    return new WebSite(webSiteData.id, webSiteData.name, webSiteData.mappingList);
                })
            } else {
                return undefined;
            }
        });
    }

    createWebSite(name: string, mappingList: Mapping[]): Promise<string> {
        let webSite = {
            name,
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

    updateWebSite(id : string, name : string, mappingList : Mapping[]) : Promise<"WebSiteUpdated"> {
        let webSite = {
            id,
            name,
            mappingList
        }
        const webSiteUpdateURL = 'http://' + config.website.host + ':' + config.website.port + '/website/update';
        let optionWebSiteUpdate = {
            method: 'POST',
            body:    JSON.stringify(webSite),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(webSiteUpdateURL, optionWebSiteUpdate)
            .then(response => {
                if (response.ok) {
                    return "WebSiteUpdated"
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }
    
}
