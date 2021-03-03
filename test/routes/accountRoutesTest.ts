import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";

describe("Account", () => {

    // tslint:disable-next-line: prefer-const
    let token;
    
    const BASE_URL = "http://localhost:5008/account";

    it("should signup", () => {
        const url = `${BASE_URL}/signup`;
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
            .then((username) => {
                expect(username).to.eql("test");
            });
    });

    it("should signin", () => {
        const url = `${BASE_URL}/signin`;
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

    it("should add a site list", () => {
        const url = `${BASE_URL}/addwebsite`;
        const body = {
            token,
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
            .then( newToken => {
                expect(newToken.jwt).to.not.be.undefined;
            });
    });

});
