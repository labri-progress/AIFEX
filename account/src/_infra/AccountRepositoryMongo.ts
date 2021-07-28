import Account from "../domain/Account";
import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import AccountModel, { AccountDocument } from "./AccountSchema";

export default class AccountRepositoryMongo implements AccountRepository {

    public createAccount(username: string, email: string, salt: Uint8Array, hash : Uint8Array): Promise<"AccountCreated" | "UserNameAlreadyTaken"> {
        return AccountModel.findOne({ username }).exec()
            .then((accountDocument: AccountDocument | null) => {
                if (accountDocument !== null) {
                    return "UserNameAlreadyTaken";
                } else {
                    return AccountModel.create({
                        username: username,
                        email: email,
                        hash: [...hash.values()],
                        salt: [...salt.values()],
                        authorizationSet: []
                    })
                    .then(() => {
                        return "AccountCreated";
                    });
                }
            });
    }

    public updateAccount(account: Account): Promise<"AccountUpdated"> {
        const username = account.username;
        const authorizationSet = account.authorizationSet.map((authorization) => {
            return {
                kind: authorization.kind,
                key: authorization.key,
            };
        });
        return AccountModel.updateOne({ username }, { $set: { authorizationSet } })
            .exec()
            .then(() => {
                return "AccountUpdated";
            });
    }

    public findAccountByUserName(username: string): Promise<Account | undefined> {
        return AccountModel.findOne({ username }).exec()
            .then((accountDocument: AccountDocument | null) => {
                if (accountDocument === null) {
                    return undefined;
                }
                const account = new Account(accountDocument.username, accountDocument.email, Uint8Array.from(accountDocument.salt), Uint8Array.from(accountDocument.hash));

                accountDocument.authorizationSet.forEach((authorizationDoc) => {
                    const authorization = new Authorization(authorizationDoc.kind, authorizationDoc.key);
                    account.addAuthorization(authorization);
                });
                return account;
            });
    }

}
