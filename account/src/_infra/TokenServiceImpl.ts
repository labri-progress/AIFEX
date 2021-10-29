import jsonwebtoken from "jsonwebtoken";
import config from "./config";
import TokenService from "../domain/TokenService";
import Token from "../domain/Token";
import Account from "../domain/Account";


const DURATION = '4h';
// const DURATION = '10000';

export default class TokenServiceImpl implements TokenService {
    verify(token : Token) : boolean {
        try {
            jsonwebtoken.verify(token.token, config.tokenSecret);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    token2Username(token : Token) : string | undefined {
        try {
            const payload : {username: string} = jsonwebtoken.verify(token.token, config.tokenSecret) as {username: string};
            return payload.username;
        } catch (e) {
            return undefined;
        }
    }
    
    account2Token(account : Account): Token {
        return new Token(jsonwebtoken.sign({username:account.username}, config.tokenSecret, {expiresIn:DURATION}));
    }
}

