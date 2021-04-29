import Token from "./Token";
import WebSite from "./WebSite";

export default interface WebSiteService {

    getWebSiteIds(token : Token) : Promise<string[] | "Unauthorized" >;

    getWebSiteById(token : Token, id : string) : Promise<WebSite | "Unauthorized">;

}