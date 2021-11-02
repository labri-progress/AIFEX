import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";
import { dropAllDatabases } from "../services/databasesService";

const SESSION_URL = "http://localhost:5001/session/";
const WEBSITE_URL = "http://localhost:5000/website/";


before("Dropping database", async () => {
    await dropAllDatabases();
})

describe("Infra", () => {
    let webSiteId;
    let sessionId;

    describe("session", () => {

        before(() => {
            const url = WEBSITE_URL + "create";
            const body = {
                name: "test",
                url:"https://www.test.test",
                mappingList: [],
            };
            const option = {
                method: "POST",
                body:    JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            };
            return fetch(url, option)
                .then(res => {
                    return res.json();
                })
                .then(id => {
                    webSiteId = id;
                })
        });

        it("should create an new session", () => {
            const url = SESSION_URL + "create";
            const body = {
                webSiteId: webSiteId,
                baseURL: "http://www.test.com/index.html",
                name:"testsession",
                description: "test",
                overlayType: "shadow",
                recordingMode: "byexploration"
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
            .then((createdSessionId) => {
                // tslint:disable-next-line: no-unused-expression
                expect(createdSessionId).to.not.be.undefined;
                // tslint:disable-next-line: no-unused-expression
                expect(createdSessionId).to.not.be.null;

                sessionId = createdSessionId;
            });
        });
        it("should get the created session", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                expect(session.webSite.name).to.equal("test");
                expect(session.baseURL).to.equal("http://www.test.com/index.html");
                expect(session.explorationList.length).to.equal(0);
            });
        });

        it("should add an exploration to the session", () => {
            const url = SESSION_URL + sessionId + "/exploration/add";
            const body = {
                testerName: "superTester",
                interactionList: [
                    {index: 0, concreteType: "Action", kind: "add", value: "5"},
                    {index: 1, concreteType: "Comment", kind: "bug", value: "important"},
                    {index: 2, concreteType: "Action", kind: "remove", value: "3"},
                ],
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
            .then( (explorationNumber) => {
                expect(explorationNumber).to.equal(0);
            });

        });

        it("should get the created exploration", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                expect(session.webSite.name).to.equal("test");
                expect(session.baseURL).to.equal("http://www.test.com/index.html");
                expect(session.explorationList.length).to.equal(1);
                expect(session.explorationList[0].interactionList.length).to.equal(3);
            });
        });

    });
});
