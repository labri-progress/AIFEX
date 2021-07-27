import "mocha";
import chai from "chai";
const expect = chai.expect;
import Account from "../../src/domain/Account";
import crypto from "crypto";
import Authorization from "../../src/domain/Authorization";
import { Kind } from "../../src/domain/Kind";
import {account2Token, token2AuthorizationSet, token2Username} from "../../src/domain/TokenEncoder";
import Token from "../../src/domain/Token";

describe("Token encoder", () => {
    it("should create a token", () => {
        const account = new Account("username", "u.u@u.com", crypto.randomBytes(8), crypto.randomBytes(8));
        account.addAuthorization(new Authorization(Kind.Model, "key"));
        account2Token(account);
    });
    it("should decode a token username", () => {
        const account = new Account("username", "u.u@u.com", crypto.randomBytes(8), crypto.randomBytes(8));
        account.addAuthorization(new Authorization(Kind.Model, "key"));
        const token = account2Token(account);
        const username = token2Username(token);
        expect(username).to.be.equal("username");
    });
    it("should decode a token authorization", () => {
        const account = new Account("username", "u.u@u.com", crypto.randomBytes(8), crypto.randomBytes(8));
        account.addAuthorization(new Authorization(Kind.Model, "key"));
        const token = account2Token(account);
        const payload = token2AuthorizationSet(token);
        expect(payload).not.to.be.equal("InvalidToken");
        if (payload !== "InvalidToken") {
            expect(payload.length).to.be.equal(1);
            expect(payload[0].key).to.be.equal("key");
            expect(payload[0].kind).to.be.equal(Kind.Model);
        }
    });
    it("should not decode a wrong token", () => {
        expect(() => {token2AuthorizationSet(new Token("wrong"));}).to.throw;
        
    })
});