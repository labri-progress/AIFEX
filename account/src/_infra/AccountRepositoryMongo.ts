import Account from "../domain/Account";
import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import Invitation from "../domain/Invitation";
import AccountModel, { AccountDocument } from "./AccountSchema";

export default class AccountRepositoryMongo implements AccountRepository {

    public addAccount(account: Account): Promise<"AccountCreated"> {
        return AccountModel.create({
            username: account.username,
            email: account.email,
            hash: [...account.hash.values()],
            salt: [...account.salt.values()],
            authorizationSet: [],
            sendInvitationSet: [],
            receivedInvitationSet: [],

        })
        .then(() => {
            return "AccountCreated";
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
        const receivedInvitationSet = account.receivedInvitationSet.map((invitation) => {
            return {
                username: invitation.username, 
                authorization: {
                    kind: invitation.authorization.kind,
                    key: invitation.authorization.key
                }
            };
        });
        const sendInvitationSet = account.sendInvitationSet.map((invitation) => {
            return {
                username: invitation.username, 
                authorization: {
                    kind: invitation.authorization.kind,
                    key: invitation.authorization.key
                }
            };
        });
        return AccountModel.updateOne({ username }, { $set: { authorizationSet, receivedInvitationSet, sendInvitationSet } })
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

                accountDocument.receivedInvitationSet.forEach((invitationDoc) => {
                    const invitation = new Invitation(invitationDoc.username, new Authorization(invitationDoc.authorization.kind, invitationDoc.authorization.key));
                    account.addReceivedInvitation(invitation);
                });

                accountDocument.sentInvitationSet.forEach((invitationDoc) => {
                    const invitation = new Invitation(invitationDoc.username, new Authorization(invitationDoc.authorization.kind, invitationDoc.authorization.key));
                    account.addSentInvitation(invitation);
                });
                return account;
            });
    }

}
