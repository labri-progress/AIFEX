import Account from "./Account";
import Token from "./Token";
import jsonwebtoken from "jsonwebtoken";
import Authorization from "./Authorization";
import { Kind } from "./Kind";
import config from "../_infra/config";


const DURATION = '4h';
// const DURATION = '10000';

export function token2AuthorizationSet(token : Token) : Authorization[] | "InvalidToken" {
    try {
        const payload = jsonwebtoken.verify(token.token, config.tokenSecret) as {username: string, authorizationSet: Object[]};
        return payload.authorizationSet.map( authorizationObject => {
            const  authorization : {_kind: Kind, _key:string} = authorizationObject as {_kind: Kind, _key:string};
            return new Authorization(authorization._kind, authorization._key);
        });
    } catch (e) {
        return "InvalidToken";
    }
}

export function token2Username(token : Token) : string | "InvalidToken" {
    try {
        const payload : {username: string, authorizationSet: Object[]} = jsonwebtoken.verify(token.token, config.tokenSecret) as {username: string, authorizationSet: Object[]};
        return payload.username;
    } catch (e) {
        return "InvalidToken";
    }
}

export function account2Token(account : Account): Token {
    return new Token(jsonwebtoken.sign({username:account.username, authorizationSet: account.authorizationSet}, config.tokenSecret, {expiresIn:DURATION}));
}