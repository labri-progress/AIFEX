import AccountRepository from "../domain/AccountRepository";
import crypto from "crypto";
import util from "util";
import * as sha256 from "fast-sha256";
import Account from "../domain/Account";
import Authorization from "../domain/Authorization";
import Token from "../domain/Token";
import { account2Token, token2AuthorizationSet, token2Username } from "../domain/TokenEncoder";

const ROUNDS = 2000;
const DKLEN = 128;

export default class AccountService {

    private _accountRepository : AccountRepository;

    constructor(accountRepository : AccountRepository) {
        if (accountRepository === null || accountRepository === undefined) {
            throw new Error('cannot create AccountService with no AccountRepository')
        }
        this._accountRepository = accountRepository;
    }

    signup(username : string, password : string) : Promise<string>{
        return this._accountRepository.findAccountByUserName(username)
            .then( account => {
                if (account === null) {
                    const encoder = new util.TextEncoder();
                    const rounds = ROUNDS;
                    const saltBuffer = crypto.randomBytes(8);
                    const dkLen = DKLEN;
                    const hash = sha256.pbkdf2(encoder.encode(password), saltBuffer, rounds, dkLen);
                    return this._accountRepository.addAccount(new Account(username, saltBuffer, hash));
                } else {
                    return Promise.reject("username exists already");
                }
            })

    }

    signin(username : string, password : string) : Promise<Token> {
        return this._accountRepository.findAccountByUserName(username)
            .then( account => {
                if (account === null) {
                    return Promise.reject("username does not exist !")
                } 
                const encoder = new util.TextEncoder();
                const rounds = ROUNDS;
                const saltBuffer = account.salt;
                const dkLen = DKLEN;
                const computedHash = sha256.pbkdf2(encoder.encode(password), saltBuffer, rounds, dkLen);
                if (computedHash.length !== account.hash.length) {
                    return Promise.reject("username / password don't match !")
                }
                for (let i = 0; i < computedHash.length; i++) {
                    if (computedHash[i] !== account.hash[i]) {
                        return Promise.reject("username / password don't match !")
                    }
                }
                return account2Token(account);
            })
    }

    getAuthorizationSet(token : Token) : Array<Authorization> {
        return token2AuthorizationSet(token);
    }

    getUsername(token : Token) : string {
        return token2Username(token);
    }

    addAuthorization(token : Token, authorization : Authorization ) : Promise<Token> {
        const username = token2Username(token);
        let account;
        return this._accountRepository.findAccountByUserName(username)
            .then( foundAccount => {
                if (foundAccount === null) {
                    return Promise.reject("username does not exist !")
                } 
                account = foundAccount;
                account.addAuthorization(authorization);
                return account;
            })
            .then( account => {
                return this._accountRepository.updateAccount(account);
            })
            .then( () => {
                return account2Token(account);
            })
    }

    removeAuthorization(token : Token, authorization : Authorization ) : Promise<Token> {
        const username = token2Username(token);
        let account;
        return this._accountRepository.findAccountByUserName(username)
            .then( foundAccount => {
                if (foundAccount === null) {
                    return Promise.reject("username does not exist !")
                } 
                account = foundAccount;
                account.removeAuthorization(authorization);
                return account;
            })
            .then( account => {
                return this._accountRepository.updateAccount(account);
            })
            .then( () => {
                return account2Token(account);
            })
    }
}