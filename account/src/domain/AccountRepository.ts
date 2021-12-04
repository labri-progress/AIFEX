import Account from "./Account";
import Authorization from "./Authorization";
import Invitation from "./Invitation";

export default interface AccountRepository {
    addAccount(account: Account) : Promise<"AccountCreated">;
    updateAccountByAddingAuthorizationAndInvitation(account : Account) : Promise<"AccountUpdated">;
    updateAccountByRemovingAuthorization(account : Account, authorization : Authorization) : Promise<"AccountUpdated">;
    updateAccountByRemovingReceivedInvitation(account : Account, invitation : Invitation) : Promise<"AccountUpdated">;
    updateAccountByRemovingSentInvitation(account : Account, invitation : Invitation) : Promise<"AccountUpdated">;
    findAccountByUserName(username : string) : Promise<Account | undefined>;
}