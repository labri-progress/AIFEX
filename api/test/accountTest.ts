import json from "body-parser/lib/types/json";
import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";
import config from "../src/config";

const host = config.host
const port = config.port;

const URL = `http://${host}:${port}`;


describe("Account", () => {

    // tslint:disable-next-line: prefer-const
    let token;
    

    it("sign in", () => {
        const url = `${URL}/account/signin`;
        const body = {
            username: "anonymous",
            password: "anonymous",
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(res);
                } 
            })
    });


});
