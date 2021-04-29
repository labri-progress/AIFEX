import fetch from "node-fetch";
import AccountService from '../domain/AccountService'
import config from "../config";
import Token from "../domain/Token";
const URL: string = `http://${config.account.host}:${config.account.port}/account/`;

export default class AccountServiceHTTP implements AccountService {


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

}
