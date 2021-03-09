import Token from "./Token";

export default interface AccountService {
    
    signup(username: string, password: string): Promise<string>;

    signin(username: string, password: string): Promise<Token>;

    addWebSite(token: Token, webSiteId: string): Promise<string>;

    removeWebSite(token: Token, webSiteId: string): Promise<string>;

    addSession(token: Token, sessionId: string): Promise<string>;

    removeSession(token: Token, sessionId: string): Promise<string>;


}