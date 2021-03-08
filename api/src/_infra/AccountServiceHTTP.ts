import fetch from "node-fetch";

import AccountService from '../domain/AccountService'
import config from "../config";
import { HTTPResponseError } from '../domain/HTTPResponseError';
import Token from "../domain/Token";
const URL: string = `http://${config.account.host}:${config.account.port}/account/`;

export default class AccountServiceHTTP implements AccountService {


    signup(username: string, password: string): Promise<string> {
        
        const route: string = URL + "signup/";
        return fetch(route, {
            method: 'post',
            body: JSON.stringify({username, password}),
            headers: { 'Content-Type': 'application/json' }
        })
        .then( (response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new HTTPResponseError(response)
            }
        })
        .then( (usernameResult) => {
            return usernameResult;
        });
    }

    signin(username: string, password: string): Promise<string> {
        const route: string = URL + "signin/";
        return fetch(route, {
                method: 'post',
                body: JSON.stringify({username, password}),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( (response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new HTTPResponseError(response)
                }
            })
            .then( (tokenResult) => {
                return new Token(tokenResult);
            });
    }

    addWebSite(token: string, webSiteId: string): Promise<string> {
        const accountAddWebSiteURL = URL + 'addwebsite/';
        let bodyAddWebSite = {
            token,
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
                    return response.json();
                } else {
                    throw new Error('cannot add website to account');
                }
            })
            .catch( e => {
                console.log(e);
            })
    }

    removeWebSite(token: string, webSiteId: string): Promise<string> {
        const accountAddWebSiteURL = URL + 'removewebsite';
        let bodyRemoveWebSite = {
            token,
            webSiteId,
        }
        let optionRemoveWebSite = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveWebSite),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddWebSiteURL, optionRemoveWebSite)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('cannot add website to account');
                }
            })
            .catch( e => {
                console.log(e);
            })
    }
    addSession(token: string, sessionid: string): Promise<string> {
        const accountAddSessionURL = URL + 'addsession/';
        let bodyAddSession = {
            token,
            sessionid,
        }
        let optionAddSession = {
            method: 'POST',
            body:    JSON.stringify(bodyAddSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddSessionURL, optionAddSession)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('cannot add website to account');
                }
            })
            .catch(e => {
                console.log(e);
            })
    }

    removeSession(token: string, sessionid: string): Promise<string> {
        const accountRemoveSessionURL = URL + 'removesession';
        let bodyRemoveSession = {
            token,
            sessionid,
        }
        let optionRemoveSession = {
            method: 'POST',
            body:    JSON.stringify(bodyRemoveSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountRemoveSessionURL, optionRemoveSession)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('cannot add website to account');
                }
            })
            .catch( e => {
                console.log(e);
            })
    }


}
