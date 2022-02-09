import Account from "../domain/Account";
import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import Invitation from "../domain/Invitation";
import { logger } from "../logger";
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

    public updateAccountByAddingAuthorizationAndInvitation(account: Account): Promise<"AccountUpdated"> {
        logger.debug("updateAccountByAddingAuthorizationAndInvitation:"+JSON.stringify(account));
        const username = account.username;
        const authorizationSet = account.authorizationSet.map((authorization) => {
            return {
                kind: authorization.kind,
                key: authorization.key,
            };
        });
        logger.debug("authorizationSet:"+JSON.stringify(authorizationSet));
        const receivedInvitationSet = account.receivedInvitationSet.map((invitation) => {
            return {
                fromUsername: invitation.fromUsername,
                toUsername: invitation.toUsername,
                authorization: {
                    kind: invitation.authorization.kind,
                    key: invitation.authorization.key
                }
            };
        });
        const sentInvitationSet = account.sentInvitationSet.map((invitation) => {
            return {
                fromUsername: invitation.fromUsername,
                toUsername: invitation.toUsername,
                authorization: {
                    kind: invitation.authorization.kind,
                    key: invitation.authorization.key
                }
            };
        });
        return AccountModel.updateOne({ username }, { $addToSet: { authorizationSet, receivedInvitationSet, sentInvitationSet } })
            .exec()
            .then(() => {
                return "AccountUpdated";
            });
    }

    updateAccountByRemovingAuthorization(account : Account, authorization : Authorization) : Promise<"AccountUpdated"> {
        logger.debug("updateAccountByRemovingAuthorization:"+JSON.stringify(account));
        const username = account.username;
        return AccountModel.updateOne({ username }, { $pull: { authorizationSet: { kind: authorization.kind, key: authorization.key } } })
            .exec()
            .then(() => {
                return "AccountUpdated";
            });
    }

    updateAccountByRemovingReceivedInvitation(account : Account, invitation : Invitation) : Promise<"AccountUpdated"> {
        logger.debug("updateAccountByRemovingReceivedInvitation:"+JSON.stringify(account));
        const username = account.username;
        return AccountModel.updateOne({ username }, { $pull: { receivedInvitationSet: { fromUsername: invitation.fromUsername, toUsername: invitation.toUsername } } })
            .exec()
            .then(() => {
                return "AccountUpdated";
            });
    }

    updateAccountByRemovingSentInvitation(account : Account, invitation : Invitation) : Promise<"AccountUpdated"> {
        logger.debug("updateAccountByRemovingSentInvitation:"+JSON.stringify(account));
        const username = account.username;
        return AccountModel.updateOne({ username }, { $pull: { sentInvitationSet: { fromUsername: invitation.fromUsername, toUsername: invitation.toUsername } } })
            .exec()
            .then(() => {
                return "AccountUpdated";
            });
    }


    public findAccountByUserName(username: string): Promise<Account | undefined> {
        return AccountModel.findOne({ username }).exec()
            .then((accountDocument: AccountDocument | null) => {
                console.log("Account Document : ", JSON.stringify(accountDocument))
                if (accountDocument === null) {
                    return undefined;
                }
                const account = new Account(accountDocument.username, accountDocument.email, Uint8Array.from(accountDocument.salt), Uint8Array.from(accountDocument.hash));

                accountDocument.authorizationSet.forEach((authorizationDoc) => {
                    const authorization = new Authorization(authorizationDoc.kind, authorizationDoc.key);
                    account.addAuthorization(authorization);
                });

                accountDocument.receivedInvitationSet.forEach((invitationDoc) => {
                    const invitation = new Invitation(invitationDoc.fromUsername, invitationDoc.toUsername, new Authorization(invitationDoc.authorization.kind, invitationDoc.authorization.key));
                    account.addReceivedInvitation(invitation);
                });

                accountDocument.sentInvitationSet.forEach((invitationDoc) => {
                    const invitation = new Invitation(invitationDoc.fromUsername, invitationDoc.toUsername, new Authorization(invitationDoc.authorization.kind, invitationDoc.authorization.key));
                    account.addSentInvitation(invitation);
                });
                return account;
            });
    }

}
