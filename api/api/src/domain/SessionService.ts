import Session from "./Session";


export default interface WebSiteService {

    getSessionById(id : number) : Promise<Session>;

    createSession(webSiteId: string, baseURL: string, name: string, overlayType: string, useTestScenario: boolean) : Promise<string>;

}