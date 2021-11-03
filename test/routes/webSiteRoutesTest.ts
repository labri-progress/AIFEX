
import chai from "chai";
const expect = chai.expect;
import "mocha";
import { dropAllDatabases } from "./databasesService";
import fetch from "node-fetch";

const WEBSITE_URL = "http://localhost:5000/website/";


before("Dropping database", async () => {
    await dropAllDatabases();
})

describe("website", () => {
    let id : string | undefined;

    it("should create a new website named Test", () => {
        const url = WEBSITE_URL + "create";
        const body = {
            name: "test",
            mappingList: [],
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
        .then((res) => {
            return res.json();
        })
        .then((webSiteId) => {
            id = typeof webSiteId === 'string' ? webSiteId : undefined;
            expect(webSiteId).to.not.be.undefined;
        });
    });
    it("should find website by id", () => {
        const url = WEBSITE_URL + id;
        return fetch(url)
            .then((res) => res.json())
            .then(webSite => {
                let websiteCasted = webSite as any;
                expect(websiteCasted.name).to.equal("test");
                expect(websiteCasted.mappingList.length === 0).to.be.true;
        });
    });

    it("should update test website", () => {
        const url = WEBSITE_URL + "update";
        const body = {
            name: "test",
            id: id,
            mappingList: [{
                match: {
                    selector: "body",
                    event: "click",
                    multi: true,
                },
                output: {
                    prefix: "begin",
                },
            }],
        };
        const option = {
            method: "POST",
            body:    JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(url, option)
            .then((res) => res.json())
            .then((websiteId) => {
                expect(websiteId).to.equal(id);
                const url = WEBSITE_URL + id;
                return fetch(url);
            })
            .then( (res) => res.json())
            .then((webSite) => {
                let websiteCasted = webSite as any;
                expect(websiteCasted.mappingList.length).to.equal(1);
            });
    });
});
