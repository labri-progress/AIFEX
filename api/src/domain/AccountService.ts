import Token from "./Token";

export default interface AccountService {
    
    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated">;
    
    signin(username: string, password: string): Promise<Token | "Unauthorized">;

    addWebSite(token: Token, webSiteId: string): Promise<Token | "Unauthorized">;

    addSession(token: Token, sessionId: string): Promise<Token | "Unauthorized">;


}