import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";

const API_URL = "http://localhost:5005";

describe("API", () => {

    // tslint:disable-next-line: prefer-const
    let token;

    it("should ping", () => {
        const url = `${API_URL}/ping`;
        return fetch(url)
            .then((res) => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.eql("alive");
            });
    });
    

    it("should signup", () => {
        const url = `${API_URL}/signup`;
        const body = {
            username:"test",
            email:"test@test.com",
            password: "test"
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        };
        return fetch(url, option)
            .then((res) => {
                console.log(res);
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.eql("AccountCreated");
            });
    });

    it("should not signup twice", () => {
        const url = `${API_URL}/signup`;
        const body = {
            username:"test",
            email:"test@test.com",
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
        const url = `${API_URL}/signin`;
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
                expect(json.bearerToken).to.not.be.undefined;
                token = json.bearerToken;
            });
    });


    it("should not signin with a wrong password", () => {
        const url = `${API_URL}/signin`;
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
            .then((result) => {
                expect(result.message).to.be.eql("Unauthorized");
            });
    });

    it("should get the account", () => {
        const url = `${API_URL}/account`;
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


    it("should add a new WebSite", () => {
        const url = `${API_URL}/websites`;
        const body = {
            name: "MyWebSite",
            url: "http://mywebsite.com",
            mappingList: [
                {
                    match: {
                        event: "click",
                        css: "body"
                    },
                    output: {
                        prefix: "clickOnBody"
                    }
                }
            ]
        };
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`}
            })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.text();
            })
            .then((webSite) => {
                expect(webSite.id).to.not.be.undefined;
            });
    });

    
});
