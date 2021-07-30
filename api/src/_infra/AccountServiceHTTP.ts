import fetch from "node-fetch";
import AccountService from '../domain/AccountService'
import config from "./config";
import Token from "../domain/Token";
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


    addWebSite(token: Token, webSiteId: string): Promise<Token | "Unauthorized" > {
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
                    return response.json().then((token)=>new Token(token.jwt));
                } else {
                    throw new Error('cannot add website to account');
                }
            })
    }


    addSession(token: Token, sessionid: string): Promise<Token | "Unauthorized" > {
        const accountAddSessionURL = 'http://' + config.account.host + ':' + config.account.port + '/account/addsession';
        let bodyAddSession = {
            token:token.token,
            sessionid,
        }
        let optionAddsession = {
            method: 'POST',
            body:    JSON.stringify(bodyAddSession),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(accountAddSessionURL, optionAddsession)
            .then(response => {
                if (response.ok) {
                    return response.json().then((token)=>new Token(token.jwt));
                } else {
                    throw new Error('cannot add website to account');
                }
            })
    }

}
