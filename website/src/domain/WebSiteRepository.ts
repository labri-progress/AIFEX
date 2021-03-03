import WebSite from "../domain/WebSite";
export default interface WebSiteRepository {

    add(webSite: WebSite): Promise<string>;

    update(webSite: WebSite): Promise<string>;

    findWebSiteById(id: string): Promise<WebSite | undefined>;

}
