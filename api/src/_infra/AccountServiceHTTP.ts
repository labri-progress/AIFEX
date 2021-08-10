import fetch from "node-fetch";
import AccountService from '../domain/AccountService'
import config from "./config";
import Token from "../domain/Token";
import Account from "../domain/Account";
import Authorization from "../domain/Authorization";
import Invitation from "../domain/Invitation";
import { Kind } from "../domain/Kind";
import { logger } from "../logger";
const URL: string = `http://${config.account.host}:${config.account.port}/account/`;

export default class AccountServiceHTTP implements AccountService {

    signup(username: string, email: string, password: string): Promise<"UserNameAlreadyTaken" | "AccountCreated"> {
        const route: string = URL + "signup/";
        return fetch(route, {
                method: 'post',
                body: JSON.stringify({username, email, password}),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( (response) => {
                if (response.ok) {
                    return "AccountCreated";
                } else {
                    return "UserNameAlreadyTaken";
                }
            })
    }

    signin(username: string, password: string): Promise<Token | "Unauthorized" > {
        const route: string = URL + "signin/";
        return fetch(route, {
                method: 'post',
                body: JSON.stringify({username, password}),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( (response) => {
                if (response.ok) {
                    return response.json().then( (tokenResult) => {
                        return new Token(tokenResult.jwt);
                    });
                } else {
                    return "Unauthorized";
                }
            })
    }

    getAccount(token: Token): Promise<Account | "Unauthorized"> {
        const route: string = URL + "account";
        return fetch(route, {
                method: 'post',
                body: JSON.stringify({token: token.token}),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( (response) => {
                if (response.ok) {
                    return response.json().then( (result) => {
                        logger.debug(JSON.stringify(result));
                        const authSet = result.authorizationSet.map((authInJson: { kind: Kind; key: string; }) => new Authorization(authInJson.kind, authInJson.key));
                        const receivInv = result.receivedInvitationSet.map((invInJson: {username: string, authorization: { kind: Kind; key: string; }}) => new Invitation(invInJson.username, new Authorization(invInJson.authorization.kind, invInJson.authorization.key)));
                        const sendInv = result.sendInvitationSet.map((invInJson: {username: string, authorization: { kind: Kind; key: string; }}) => new Invitation(invInJson.username, new Authorization(invInJson.authorization.kind, invInJson.authorization.key)));
                        return new Account(result.username, authSet, receivInv, sendInv);
                    });
                } else {
                    return "Unauthorized";
                }
            })
    }


    addWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteAdded" > {
        const accountAddWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addwebsite';
        let bodyAddWebSite = {
            token:token.token,
            webSiteId,
        }
        let optionAddWebSite = {
            method: 'POST',
            body:    JSON.stringify(bodyAddWebSite),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddWebSiteURL, optionAddWebSite)
            .then(response => {
                if (response.ok) {
                    return "WebSiteAdded";
                } else {
                    return "Unauthorized";
                }
            })
    }

    removeWebSite(token: Token, webSiteId: string): Promise<"Unauthorized" | "WebSiteRemoved"> {
        const accountRemoveWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removewebsite';
        let bodyRemoveWebSite = {
            token:token.token,
            webSiteId,
        }
        let optionRemoveWebSite = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveWebSite),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRemoveWebSiteURL, optionRemoveWebSite)
            .then(response => {
                if (response.ok) {
                    return "WebSiteRemoved";
                } else {
                    return "Unauthorized";
                }
            })
    }


    addSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionAdded"> {
        const accountAddSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addsession';
        let bodyAddSession = {
            token:token.token,
            sessionId,
        }
        let optionAddsession = {
            method: 'POST',
            body:    JSON.stringify(bodyAddSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddSessionURL, optionAddsession)
            .then(response => {
                if (response.ok) {
                    return "SessionAdded";
                } else {
                    return "Unauthorized";
                }
            })
    }

    removeSession(token: Token, sessionId: string): Promise<"Unauthorized" | "SessionRemoved"> {
        const accountRemoveSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removesession';
        let bodyRemoveSession = {
            token:token.token,
            sessionId,
        }
        let optionRemoveSession = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRemoveSessionURL, optionRemoveSession)
            .then(response => {
                if (response.ok) {
                    return "SessionRemoved";
                } else {
                    return "Unauthorized";
                }
            })
        
    }

    addModel(token: Token, modelId: string): Promise<"Unauthorized" | "ModelAdded"> {
        const accountAddModelURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addmodel';
        let bodyAddSession = {
            token:token.token,
            modelId,
        }
        let optionAddModel = {
            method: 'POST',
            body:    JSON.stringify(bodyAddSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddModelURL, optionAddModel)
            .then(response => {
                if (response.ok) {
                    return "ModelAdded";
                } else {
                    return "Unauthorized";
                }
            })
    }

    removeModel(token: Token, modelId: string): Promise<"Unauthorized" | "ModelRemoved"> {
        const accountRemoveModelURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removemodel';
        let bodyRemoveModel = {
            token:token.token,
            modelId,
        }
        let optionRemoveModel = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveModel),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRemoveModelURL, optionRemoveModel)
            .then(response => {
                if (response.ok) {
                    return "ModelRemoved";
                } else {
                    return "Unauthorized";
                }
            })
    }

}
