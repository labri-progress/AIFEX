import WebSite from "./WebSite";

export default interface WebSiteService {

    getWebSiteById(id : string) : Promise<WebSite>;

    createWebSite(name : string, url : string, mappingList) : Promise<string>;

    updateWebSite(id: string, name: string, url: string, mappingList: any): Promise<void>;
}