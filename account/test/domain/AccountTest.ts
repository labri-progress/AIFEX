import "mocha";
import chai from "chai";
const expect = chai.expect;
import Account from "../../src/domain/Account";
import crypto from "crypto";
import Authorization from "../../src/domain/Authorization";
import { Kind } from "../../src/domain/Kind";

describe("Account constructor", () => {
    it("should create ", () => {
        // tslint:disable-next-line: no-unused-expression
        new Account("username", crypto.randomBytes(8), crypto.randomBytes(8));
    });
    it("should add an authorization", () => {
        const account = new Account("username", crypto.randomBytes(8), crypto.randomBytes(8));
        account.addAuthorization(new Authorization(Kind.Model, "key"));
        const authorizationSet = account.authorizationSet;
        expect(authorizationSet.length).to.be.equal(1);
        expect(authorizationSet[0].kind).to.be.equal(Kind.Model);
        expect(authorizationSet[0].key).to.be.equal("key");
    })
});