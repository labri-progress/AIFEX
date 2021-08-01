import AccountRepository from "../domain/AccountRepository";
import Authorization from "../domain/Authorization";
import Token from "../domain/Token";
import { logger } from "../logger";
import { Kind } from "../domain/Kind";
import TokenService from "../domain/TokenService";
import CryptoService from "../domain/CryptoService";
import Account from "../domain/Account";

export default class AccountService {

    private _accountRepository: AccountRepository;
    private _tokenService: TokenService;
    private _cryptoService: CryptoService;

    constructor(accountRepository: AccountRepository, tokenService: TokenService, cryptoService: CryptoService) {
        this._accountRepository = accountRepository;
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

    getUsernameAndAuthorizationSet(token: Token): Promise<{username:string, authorizationSet:{key:string, kind:Kind}[]} | "InvalidToken"> {
        const username = this._tokenService.token2Username(token);
        if (username) {
            return this._accountRepository.findAccountByUserName(username)
                .then((result) => {
                    if (result) {
                        return {
                            username: result.username,
                            authorizationSet: result.authorizationSet.map(authorization=> {
                                return {key:authorization.key, kind: authorization.kind};
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

    addAuthorization(token: Token, authorization: Authorization): Promise<"AuthorizationAdded" | "IncorrectUsername"> {
        const username = this._tokenService.token2Username(token);
        if (username === undefined) {
            return Promise.resolve("IncorrectUsername");
        } else {
            return this._accountRepository.findAccountByUserName(username)
                .then((foundAccount) => {
                    if (foundAccount === undefined) {
                        return "IncorrectUsername";
                    } else {
                        foundAccount.addAuthorization(authorization);
                        logger.debug(`authorization ${JSON.stringify(authorization)} added to ${username}`);
                        return this._accountRepository.updateAccount(foundAccount)
                            .then(() => {
                                logger.debug(`account repository updated`);
                                return "AuthorizationAdded";
                            })
                    }
                })
        }
    }

    removeAuthorization(token: Token, authorization: Authorization): Promise<"AuthorizationRemoved" | "IncorrectUsername"> {
        const username = this._tokenService.token2Username(token);
        if (username === undefined) {
            return Promise.resolve("IncorrectUsername");
        } else {
            return this._accountRepository.findAccountByUserName(username)
                .then(foundAccount => {
                    if (foundAccount === undefined) {
                        return "IncorrectUsername";
                    } else {
                        foundAccount.removeAuthorization(authorization);
                        return this._accountRepository.updateAccount(foundAccount)
                            .then(() => {
                                return "AuthorizationRemoved";
                            })
                    }
                })
        }
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
                        return Promise.resolve(foundAccount.authorizationSet.some((authorization) => authorization.kind === kind && authorization.key === id));
                    }
                })
        }
    }

}