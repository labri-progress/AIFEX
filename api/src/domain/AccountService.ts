import Account from "./Account";
import Token from "./Token";

export default interface AccountService {
    
    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated">;
    
    signin(username: string, password: string): Promise<Token | "Unauthorized">;

    getAccount(token: Token): Promise<Account | "Unauthorized">;

    addWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteAdded">;
    
    removeWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteRemoved">;

    addSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionAdded">;

    removeSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionRemoved">;

    addModel(token: Token, modelId: string): Promise<"Unauthorized" | "ModelAdded">;

    removeModel(token: Token, modelId: string): Promise<"Unauthorized" | "ModelRemoved">;


}
