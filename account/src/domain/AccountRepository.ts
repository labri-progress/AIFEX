import Account from "./Account";

export default interface AccountRepository {
    addAccount(account : Account) : Promise<string>;

    updateAccount(account : Account) : Promise<string>;

    findAccountByUserName(username : string) : Promise<Account | undefined>;

}