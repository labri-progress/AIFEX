import Mapping from "./Mapping";
import Token from "./Token";
import WebSite from "./WebSite";

export default interface WebSiteService {

    ping(): Promise<boolean>;

    findWebSiteById(id : string) : Promise<WebSite | undefined>;

    createWebSite(name : string, mappingList : Mapping[]) : Promise<string>;

    updateWebSite(id : string, name : string, mappingList : Mapping[]) : Promise<"WebSiteUpdated">;

}