
export default interface AccountService {
    
    signup(username: string, password: string): Promise<string>;

    signin(username: string, password: string): Promise<string>;

    addWebSite(token: string, webSiteId: string): Promise<string>;

    removeWebSite(token: string, webSiteId: string): Promise<string>;

    addSession(token: string, sessionId: string): Promise<string>;

    removeSession(token: string, sessionId: string): Promise<string>;


}