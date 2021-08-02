import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";

const ACCOUNT_URL = "http://localhost:5004/api";

describe("Account", () => {

    // tslint:disable-next-line: prefer-const
    let token;

    it("should ping", () => {
        const url = `${ACCOUNT_URL}/ping`;
        return fetch(url)
            .then((res) => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.eql("AccountCreated");
            });
    });
    

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
                expect(result.message).to.eql("AccountCreated");
            });
    });

    it("should not signup twice", () => {
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
                expect(res.ok).to.be.false;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.eql("UserNameAlreadyTaken");
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
                expect(json.jwt).to.not.be.undefined;
                token = json.jwt;
            });
    });


    it("should not signin with a wrong password", () => {
        const url = `${ACCOUNT_URL}/signin`;
        const body = {
            username: "test",
            password: "tost",
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
            .then((res) => {
                expect(res.ok).to.be.false;
                return res.json();
            })
            .then((json) => {
                expect(json).to.be.eql("Unauthorized");
            });
    });

    it("should get the account", () => {
        const url = `${ACCOUNT_URL}/account`;
        return fetch(url, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`}
            })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((account) => {
                expect(account.username).eql("test");
                expect(account.authorizationSet.length).eql(0);
            });
    });

    
});
