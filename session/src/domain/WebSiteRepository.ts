import Website from "../domain/WebSite";
export default interface WebSiteRepository {
    findWebSiteById(webSiteId: string): Promise<Website | undefined>;
}
