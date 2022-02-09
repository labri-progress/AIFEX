import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import Token from "../domain/Token";
import { logger } from "../logger";
import { Kind } from "../domain/Kind";
import TokenService from "../domain/TokenService";
import CryptoService from "../domain/CryptoService";
import Account from "../domain/Account";
import Invitation from "../domain/Invitation";
import PublicAuthorizationRepository from "../domain/PublicAuthorizationRepository";

export default class AccountService {

    private _accountRepository: AccountRepository;
    private _publicAuthorizationRepository: PublicAuthorizationRepository;
    private _tokenService: TokenService;
    private _cryptoService: CryptoService;

    constructor(accountRepository: AccountRepository, publicAuthorizationRepository: PublicAuthorizationRepository, tokenService: TokenService, cryptoService: CryptoService) {
        this._accountRepository = accountRepository;
        this._publicAuthorizationRepository = publicAuthorizationRepository;
        this._tokenService = tokenService;
        this._cryptoService = cryptoService;
    }

    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated"> {
        return this._accountRepository.findAccountByUserName(username)
            .then(account => {
                if (account === undefined) {
                    const {salt, hash} = this._cryptoService.saltAndHashPassword(password);
                    return this._accountRepository.addAccount(new Account(username, email, salt, hash));
                } else {
                    return "UserNameAlreadyTaken";
                }
            }); 
    }

    signin(username: string, password: string): Promise<Token | "IncorrectUsernameOrPassword"> {
        return this._accountRepository.findAccountByUserName(username)
            .then(account => {
                if (account === undefined) {
                    return "IncorrectUsernameOrPassword";
                } else {
                    if (this._cryptoService.checkPassword(password, account.salt, account.hash)) {
                        return this._tokenService.account2Token(account);
                    } else {
                        return "IncorrectUsernameOrPassword";
                    }
                }
            })
    }

    getAccount(token: Token): Promise<
        {
            username:string, 
            authorizationSet:{key:string, kind:Kind}[], 
            receivedInvitationSet:{fromUsername:string, toUsername: string, authorization:{kind:Kind,key:string}}[],
            sentInvitationSet:{fromUsername:string, toUsername: string, authorization:{kind:Kind,key:string}}[]
        } 
        | "InvalidToken"> {
        const username = this._tokenService.token2Username(token);
        if (username) {
            return this._accountRepository.findAccountByUserName(username)
                .then((result) => {
                    if (result) {
                        return {
                            username: result.username,
                            authorizationSet: result.authorizationSet.map(authorization=> {
                                return {key:authorization.key, kind: authorization.kind};
                            }),
                            receivedInvitationSet: result.receivedInvitationSet.map(invitation=> {
                                return {fromUsername:invitation.fromUsername, toUsername: invitation.toUsername, authorization:{kind:invitation.authorization.kind,key:invitation.authorization.key}};
                            }),
                            sentInvitationSet: result.sentInvitationSet.map(invitation=> {
                                return {fromUsername:invitation.fromUsername, toUsername: invitation.toUsername, authorization:{kind:invitation.authorization.kind,key:invitation.authorization.key}};
                            })
                        }
                    } else {
                        return "InvalidToken";
                    }
                });
        } else {
            return Promise.resolve("InvalidToken");
        }
    }

    addAuthorization(username: string, authorization: Authorization): Promise<"AuthorizationAdded" | "AuthorizationWasAlreadyThere" | "IncorrectUsername"> {
        return this._accountRepository.findAccountByUserName(username)
            .then((foundAccount) => {
                if (foundAccount === undefined) {
                    return "IncorrectUsername";
                } else {
                    let addResult = foundAccount.addAuthorization(authorization);
                    if (addResult === "AuthorizationAdded") {
                        logger.debug(`persisting authorization ${JSON.stringify(authorization)} to ${username}`);
                        return this._accountRepository.updateAccountByAddingAuthorizationAndInvitation(foundAccount)
                            .then(() => {
                                logger.debug(`account repository updated`);
                                return "AuthorizationAdded";
                            })
                    } else {
                        return "AuthorizationWasAlreadyThere";
                    }
                }
            })
    }

    removeAuthorization(username: string, authorization: Authorization): Promise<"AuthorizationRemoved" | "AuthorizationWasNotThere" | "IncorrectUsername"> {
        return this._accountRepository.findAccountByUserName(username)
            .then(foundAccount => {
                if (foundAccount === undefined) {
                    return "IncorrectUsername";
                } else {
                    const removeResult = foundAccount.removeAuthorization(authorization);
                    if (removeResult === "AuthorizationRemoved") {
                        return this._accountRepository.updateAccountByRemovingAuthorization(foundAccount, authorization)
                            .then(() => {
                                return "AuthorizationRemoved";
                            })
                    } else {
                        return "AuthorizationWasNotThere";
                    }
                }
            })
    }

    addInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectFromUsername" | "IncorrectToUsername" | "InvitationIsAdded"> {
        return Promise.all([this._accountRepository.findAccountByUserName(fromUsername), this._accountRepository.findAccountByUserName(toUsername)])
            .then(([fromAccount, toAccount]) => {
                if (fromAccount === undefined) {
                    return "IncorrectFromUsername";
                } else {
                    if (toAccount === undefined) {
                        return "IncorrectToUsername";
                    } else {
                        const invitation = new Invitation(fromUsername, toUsername, new Authorization(kind, key));
                        fromAccount.addSentInvitation(invitation);
                        toAccount.addReceivedInvitation(invitation);
                        return Promise.all([this._accountRepository.updateAccountByAddingAuthorizationAndInvitation(fromAccount), this._accountRepository.updateAccountByAddingAuthorizationAndInvitation(toAccount)])
                            .then(() => {
                                return "InvitationIsAdded";
                            });
                    }
                }
            });
    }

    removeInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectFromUsername" | "IncorrectToUsername" | "InvitationIsRemoved"> {
        return Promise.all([this._accountRepository.findAccountByUserName(fromUsername), this._accountRepository.findAccountByUserName(toUsername)])
            .then(([fromAccount, toAccount]) => {
                if (fromAccount === undefined) {
                    return "IncorrectFromUsername";
                } else {
                    if (toAccount === undefined) {
                        return "IncorrectToUsername";
                    } else {
                        const invitation = new Invitation(fromUsername, toUsername, new Authorization(kind, key));
                        fromAccount.removeSentInvitation(invitation);
                        toAccount.removeReceivedInvitation(invitation);
                        return Promise.all([this._accountRepository.updateAccountByRemovingSentInvitation(fromAccount,invitation), this._accountRepository.updateAccountByRemovingReceivedInvitation(toAccount, invitation)])
                            .then(() => {
                                return "InvitationIsRemoved";
                            });
                    }
                }
            });
    }



    verify(token: Token): boolean {
        return this._tokenService.verify(token);
    }

    verifyAuthorization(token: Token, kind: Kind, id: string): Promise<boolean> {
        const username = this._tokenService.token2Username(token);
        if (username === undefined) {
            return Promise.resolve(false);
        } else {
            return this._accountRepository.findAccountByUserName(username)
                .then((foundAccount) => {
                    if (foundAccount === undefined) {
                        return false;
                    } else {
                        const isAuthorized = foundAccount.authorizationSet.some((authorization) => authorization.kind === kind && authorization.key === id);
                        const isInvited = foundAccount.receivedInvitationSet.some((invitation) => invitation.authorization.kind === kind && invitation.authorization.key === id);
                        return Promise.resolve(isAuthorized || isInvited);
                    }
                })
        }
    }

    makeAuthorizationPublic(kind: Kind, key: string): Promise<"AuthorizationIsPublic"> {
        return this._publicAuthorizationRepository.makeAuthorizationPublic(new Authorization(kind, key));
    }

    revokePublicAuthorization(kind: Kind, key: string): Promise<"AuthorizationIsNoMorePublic"> {
        return this._publicAuthorizationRepository.revokePublicAuthorization(new Authorization(kind, key));
    }

    isAuthorizationPublic(kind: Kind, key: string): Promise<boolean> {
        return this._publicAuthorizationRepository.isAuthorizationPublic(new Authorization(kind, key));
    }


}