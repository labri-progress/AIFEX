import Account from "./Account";
import Token from "./Token";

export default interface TokenService {
    verify(token : Token) : boolean;
    token2Username(token : Token) : string | undefined;
    account2Token(account : Account): Token;
}

