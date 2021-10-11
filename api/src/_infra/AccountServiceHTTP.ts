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
                        const receivInv = result.receivedInvitationSet.map((invInJson: {fromUsername: string, toUsername: string, authorization: { kind: Kind; key: string; }}) => new Invitation(invInJson.fromUsername, invInJson.toUsername, new Authorization(invInJson.authorization.kind, invInJson.authorization.key)));
                        const sendInv = result.sentInvitationSet.map((invInJson: {fromUsername: string, toUsername: string, authorization: { kind: Kind; key: string; }}) => new Invitation(invInJson.fromUsername, invInJson.toUsername, new Authorization(invInJson.authorization.kind, invInJson.authorization.key)));
                        return new Account(result.username, authSet, receivInv, sendInv);
                    });
                } else {
                    return "Unauthorized";
                }
            })
    }

    addInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectUsername" | "InvitationIsAdded"> {
        const accountAddInvitationURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addinvitation';
        let bodyAddInvitation = {
            fromUsername,
            toUsername,
            key,
            kind
        }
        let optionAddInvitation = {
            method: 'POST',
            body:    JSON.stringify(bodyAddInvitation),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddInvitationURL, optionAddInvitation)
            .then(response => {
                if (response.ok) {
                    return "InvitationIsAdded";
                } else {
                    return "IncorrectUsername";
                }
            })
    }
    removeInvitation(fromUsername: string, toUsername: string, key: string, kind: Kind): Promise<"IncorrectUsername" | "InvitationIsRemoved"> {
        const accountRemoveInvitationURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removeinvitation';
        let bodyRemoveInvitation = {
            fromUsername,
            toUsername,
            key,
            kind
        }
        let optionRemoveInvitation = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveInvitation),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRemoveInvitationURL, optionRemoveInvitation)
            .then(response => {
                if (response.ok) {
                    return "InvitationIsRemoved";
                } else {
                    return "IncorrectUsername";
                }
            })
    }


    addWebSite(username: string, webSiteId: string): Promise<"WebSiteAdded" | "IncorrectUsername" > {
        const accountAddWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addwebsite';
        let bodyAddWebSite = {
            username,
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
                    return "IncorrectUsername";
                }
            })
    }

    removeWebSite(username: string, webSiteId: string): Promise<"WebSiteRemoved" | "IncorrectUsername"> {
        const accountRemoveWebSiteURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removewebsite';
        let bodyRemoveWebSite = {
            username,
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
                    return "IncorrectUsername";
                }
            })
    }


    addSession(username: string, sessionId: string): Promise<"SessionAdded" | "IncorrectUsername"> {
        const accountAddSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addsession';
        let bodyAddSession = {
            username,
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
                    return "IncorrectUsername";
                }
            })
    }

    removeSession(username: string, sessionId: string): Promise<"SessionRemoved" | "IncorrectUsername"> {
        const accountRemoveSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removesession';
        let bodyRemoveSession = {
            username,
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
                    return "IncorrectUsername";
                }
            })
        
    }

    addModel(username: string, modelId: string): Promise<"ModelAdded" | "IncorrectUsername"> {
        const accountAddModelURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addmodel';
        let bodyAddSession = {
            username,
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
                    return "IncorrectUsername";
                }
            })
    }

    removeModel(username: string, modelId: string): Promise<"ModelRemoved" | "IncorrectUsername"> {
        const accountRemoveModelURL = 'http://' + config.account.host + ':' + config.account.port + '/account/removemodel';
        let bodyRemoveModel = {
            username,
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
                    return "IncorrectUsername";
                }
            })
    }

    makeAuthorizationPublic(kind: Kind, key: string): Promise<"AuthorizationIsPublic"> {
        const accountMakeAuthorizationPublicURL = 'http://' + config.account.host + ':' + config.account.port + '/account/makeauthorizationpublic';
        let bodyMakeAuthorizationPublic = {
            kind,
            key,
        }
        let optionMakeAuthorizationPublic = {
            method: 'POST',
            body:    JSON.stringify(bodyMakeAuthorizationPublic),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountMakeAuthorizationPublicURL, optionMakeAuthorizationPublic)
            .then(response => {
                if (response.ok) {
                    return "AuthorizationIsPublic";
                } else {
                    throw new Error('Something goes wrong while making the authorization public');
                }
            })
    }

    revokePublicAuthorization(kind: Kind, key: string): Promise<"AuthorizationIsNoMorePublic"> {
        const accountRevokePublicAuthorizationURL = 'http://' + config.account.host + ':' + config.account.port + '/account/revokepublicauthorization';
        let bodyRevokePublicAuthorization = {
            kind,
            key,
        }
        let optionRevokePublicAuthorization = {
            method: 'POST',
            body:    JSON.stringify(bodyRevokePublicAuthorization),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRevokePublicAuthorizationURL, optionRevokePublicAuthorization)
            .then(response => {
                if (response.ok) {
                    return "AuthorizationIsNoMorePublic";
                } else {
                    throw new Error('Something goes wrong while revoking the authorization public');
                }
            })
    }

    isAuthorizationPublic(kind: Kind, key: string): Promise<boolean> {
        const accountIsAuthorizationPublicURL = 'http://' + config.account.host + ':' + config.account.port + '/account/isauthorizationpublic';
        let bodyIsAuthorizationPublic = {
            kind,
            key,
        }
        let optionIsAuthorizationPublic = {
            method: 'POST',
            body:    JSON.stringify(bodyIsAuthorizationPublic),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountIsAuthorizationPublicURL, optionIsAuthorizationPublic)
            .then(response => {
                if (response.ok) {
                    return response.json().then((resultJson) => !!resultJson.isPublic);
                } else {
                    throw new Error('Something goes wrong while checking the authorization public');
                }
            })
    }

}
