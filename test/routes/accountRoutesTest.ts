import chai from "chai";
const expect = chai.expect;
import "mocha";
import { dropAllDatabases } from "./databasesService";
import fetch from "node-fetch";

const ACCOUNT_URL = "http://localhost:5004/account";


before("Dropping database", async () => {
    await dropAllDatabases();
})

describe("Account", () => {

    // tslint:disable-next-line: prefer-const
    let token;
    

    it("should signup", () => {
        const url = `${ACCOUNT_URL}/signup`;
        const body = {
            username:"test",
            password: "test"
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        };
        return fetch(url, option)
            .then((res) => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.eql("AccountCreated");
            });
    });

    it("should signin", () => {
        const url = `${ACCOUNT_URL}/signin`;
        const body = {
            username: "test",
            password: "test",
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
            .then((res) => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((json) => {
                let jsonCasted = json as any;
                expect(jsonCasted.jwt).to.not.be.undefined;
                token = jsonCasted.jwt;
            });
    });

    it("should add a site list", () => {
        const url = `${ACCOUNT_URL}/addwebsite`;
        const body = {
            username: "test",
            webSiteId: "JPS8_Kiv"
        };
        return fetch(url, {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((json) => {
                let jsonCasted = json as any;
                expect(jsonCasted.message).eql("AuthorizationAdded");
            });
    });

    it("should add a session", () => {
        const url = `${ACCOUNT_URL}/addsession`;
        const sessionId = "JPSfea8_Kiv";
        const body = {
            username: "test",
            sessionId
        };
        return fetch(url, {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((json) => {
                let jsonCasted = json as any;
                expect(jsonCasted.message).eql("AuthorizationAdded");
            });
    });

    it("should remove a session", () => {
        const url = `${ACCOUNT_URL}/removesession`;
        const body = {
            username: "test",
            sessionId: "JPSfea8_Kiv"
        };
        return fetch(url, {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((json) => {
                let jsonCasted = json as any;
                expect(jsonCasted.message).eql('AuthorizationRemoved');
            });
    });

});
