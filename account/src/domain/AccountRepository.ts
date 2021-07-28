import Account from "./Account";

export default interface AccountRepository {
    addAccount(account: Account) : Promise<"AccountCreated">;
    updateAccount(account : Account) : Promise<"AccountUpdated">;
    findAccountByUserName(username : string) : Promise<Account | undefined>;
}