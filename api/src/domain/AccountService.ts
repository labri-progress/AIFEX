import Account from "./Account";
import Token from "./Token";

export default interface AccountService {
    
    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated">;
    
    signin(username: string, password: string): Promise<Token | "Unauthorized">;

    getAccount(token: Token): Promise<Account | "Unauthorized">;

    addWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteAdded">;

    addSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionAdded">;


}