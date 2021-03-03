import WebSite from "./WebSite";

export default interface WebSiteService {
    ping() : boolean;

    getWebSiteById(id : number) : Promise<WebSite>;

    createWebSite(name : string, url : string, mappingList) : Promise<string>;

    updateWebSite(id : string, name : string, url : string, mappingList) : Promise<number>;

}