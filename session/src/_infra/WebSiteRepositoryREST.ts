import fetch from "node-fetch";
import config from "./config";
import WebSite from "../domain/WebSite";
import WebSiteRepository from "../domain/WebSiteRepository";

const URL: string = `http://${config.website.host}:${config.website.port}/website/`;

export default class WebSiteRepositoryMongoREST implements WebSiteRepository {
    public findWebSiteById(id: string): Promise<WebSite> {
        const route: string = URL + id;
        return fetch(route)
        .then( (response: any) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject("findWebSite REST error");
            }
        })
        .then( (resWebSite: any) => {
            return new WebSite(resWebSite.id, resWebSite.name);
        });
    }

}
