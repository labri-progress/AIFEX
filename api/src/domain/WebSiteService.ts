import Mapping from "./Mapping";
import Token from "./Token";
import WebSite from "./WebSite";

export default interface WebSiteService {

    findWebSiteIds(token : Token) : Promise<string[] | "Unauthorized" >;

    findWebSiteById(token : Token, id : string) : Promise<WebSite | "Unauthorized">;

    createWebSite(token : Token, name : string, url : string, mappingList : Mapping[]) : Promise<string | "Unauthorized">;

}