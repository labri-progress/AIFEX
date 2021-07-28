import Account from "./Account";

export default interface AccountRepository {
    createAccount(username: string, email: string, salt : Uint8Array, hash : Uint8Array) : Promise<"AccountCreated" | "UserNameAlreadyTaken">;
    updateAccount(account : Account) : Promise<"AccountUpdated">;
    findAccountByUserName(username : string) : Promise<Account | undefined>;
}