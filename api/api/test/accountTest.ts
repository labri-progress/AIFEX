import json from "body-parser/lib/types/json";
import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";
import config from "../src/config";
import { HTTPResponseError } from "../src/domain/HTTPResponseError";

const host = config.host
const port = config.port;

const URL = `http://${host}:${port}`;


describe("Account", () => {

    // tslint:disable-next-line: prefer-const
    let token;
    

    it("create an account", () => {
        const url = `${URL}/account/signup`;
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
                if (!res.ok) {
                    if (res.status === 403) {
                        return "test"
                    }
                    throw new HTTPResponseError(res);
                }
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((username) => {
                expect(username).to.eql("test");
            });
    });

    it("sign in", () => {
        const url = `${URL}/account/signin`;
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
                if (!res.ok) {
                    throw new HTTPResponseError(res);
                } else {
                    return res.json();
                }
            })
            .then((json) => {
                expect(json.token.jwt).to.not.be.undefined;
                token = json.token.jwt
            });
    });

    it("creates a website", () => {
        const url = `${URL}/website/create`;
        const body = {
            token,
            name: "myWebsite",
            url: "www.website.com",
            mappingList: [{
                            "match": {
                                "css": "input",
                                "event": "change"
                            },
                            "output": {
                                "prefix": "Search",
                                "suffix": "value"
                            }
                        }]
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        };
        return fetch(url, option)
            .then((res) => {
                if (!res.ok) {
                    throw new HTTPResponseError(res);
                }
                expect(res.ok).to.be.true;
            })
    });

    it("get website list for token", () => {
        const url = `${URL}/website/list/${token}`;
        return fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new HTTPResponseError(res);
                }
                expect(res.ok).to.be.true;
                return res.json()
            })
            .then(data => {
                expect(data[0].name).to.eql("myWebsite")
            })
    });


});
