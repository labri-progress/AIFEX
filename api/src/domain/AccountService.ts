import Account from "./Account";
import { Kind } from "./Kind";
import Token from "./Token";

export default interface AccountService {
    
    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated">;
    
    signin(username: string, password: string): Promise<Token | "Unauthorized">;

    getAccount(token: Token): Promise<Account | "Unauthorized">;

    addInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectUsername" | "InvitationIsAdded">

    removeInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectUsername" | "InvitationIsRemoved">;

    addWebSite(username: string, webSiteId: string): Promise<"WebSiteAdded" | "IncorrectUsername">;
    
    removeWebSite(username: string, webSiteId: string): Promise<"WebSiteRemoved" | "IncorrectUsername">;

    addSession(username: string, sessionId: string): Promise<"SessionAdded" | "IncorrectUsername" >;

    removeSession(username: string, sessionId: string): Promise<"SessionRemoved" | "IncorrectUsername">;

    addModel(username: string, modelId: string): Promise<"ModelAdded" | "IncorrectUsername">;

    removeModel(username: string, modelId: string): Promise<"ModelRemoved" | "IncorrectUsername">;


}
