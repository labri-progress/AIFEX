import Account from "../domain/Account";
import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import AccountSchema, { AccountDocument } from "./AccountSchema";
export default class AccountRepositoryMongo implements AccountRepository {

    public addAccount(account: Account): Promise<string> {
        return AccountSchema.create({
            username: account.username,
            hash: [...account.hash.values()],
            salt: [...account.salt.values()],
            authorizationSet: account.authorizationSet.map( (authorization) => {
                return {
                    kind: authorization.kind,
                    key: authorization.key,
                };
            }),
        })
        .then( (document) => {
            return document.username;
        });
    }

    public updateAccount(account: Account): Promise<string> {
        const username = account.username;

        const authorizationSet = account.authorizationSet.map( (authorization) => {
            return {
                kind: authorization.kind,
                key: authorization.key,
            };
        });
        return AccountSchema.updateOne({username},{ $addToSet: { authorizationSet: { $each : authorizationSet }}})
        .exec()
        .then( () => {
            return account.username;
        });
    }

    public findAccountByUserName(username: string): Promise<Account | undefined> {
        return AccountSchema.findOne({username}).exec()
        .then((accountDocument: AccountDocument | null) => {
            if (accountDocument === null) {
                return undefined;
            }
            const account = new Account(username, Uint8Array.from(accountDocument.salt), Uint8Array.from(accountDocument.hash));

            accountDocument.authorizationSet.forEach((authorizationDoc) => {
                const authorization = new Authorization(authorizationDoc.kind, authorizationDoc.key);
                account.addAuthorization(authorization);
            });
            return account;
        });
    }

}
