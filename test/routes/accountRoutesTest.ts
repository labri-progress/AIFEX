import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";
import jsonwebtoken from "jsonwebtoken"; 
const SECRET = "not really secret";

const ACCOUNT_URL = "http://localhost:5004/account";

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
            .then((username) => {
                expect(username).to.eql("test");
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

    it("should add a site list", () => {
        const url = `${ACCOUNT_URL}/addwebsite`;
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

                const websiteList = token2WebSite(newToken.jwt);
                expect(websiteList.length).eql(1);
                expect(websiteList[0]).eql("JPS8_Kiv")
            });
    });

    it("should add a session", () => {
        const url = `${ACCOUNT_URL}/addsession`;
        const sessionid = "JPSfea8_Kiv";
        const body = {
            token,
            sessionid
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
                const sessionList = token2Session(newToken.jwt);
                expect(sessionList.length).eql(1);
                expect(sessionList[0]).eql(sessionid)
            });
    });

    it("should remove a session", () => {
        const url = `${ACCOUNT_URL}/removesession`;
        const body = {
            token,
            sessionid: "JPSfea8_Kiv"
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
                const sessionList = token2Session(newToken.jwt);
                expect(sessionList.length).eql(0);
            });
    });

});

function token2Kind(token, kind) {
    if (token === null && token === undefined)  {
        return [];
    }
    let payload = jsonwebtoken.verify(token, SECRET);
    return payload.authorizationSet.filter( authorization => authorization._kind == kind).map(authorization => authorization._key);
}

function token2WebSite (token) {
    return token2Kind(token, "2");
}

function token2Model (token) {
    return token2Kind(token, "0");
}

function token2Session(token) {
    return token2Kind(token, "1");
}
