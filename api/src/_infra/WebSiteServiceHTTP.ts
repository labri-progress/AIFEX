import fetch from "node-fetch";
import config from "../config";
import WebSite from "../domain/WebSite";
import WebSiteService from "../domain/WebSiteService";

const URL: string = `http://${config.website.host}:${config.website.port}/website/`;

export default class WebSiteServiceHTTP implements WebSiteService {
    
    ping(): boolean {
        throw new Error("Method not implemented.");
    }
    getWebSiteById(id: number): Promise<WebSite> {
        throw new Error("Method not implemented.");
    }
    createWebSite(name: string, url: string, mappingList: any): Promise<string> {
        throw new Error("Method not implemented.");
    }
    updateWebSite(id: string, name: string, url: string, mappingList: any): Promise<number> {
        throw new Error("Method not implemented.");
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
            return new WebSite(resWebSite.id, resWebSite.name);
        });
    }

}
