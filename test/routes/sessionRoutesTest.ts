import chai from "chai";
const expect = chai.expect;
import "mocha";
import { dropAllDatabases } from "./databasesService";
import fetch from 'node-fetch';

const SESSION_URL = "http://localhost:5001/session/";
const WEBSITE_URL = "http://localhost:5000/website/";


before("Dropping database", async () => {
    await dropAllDatabases();
})

describe("Infra", () => {
   

    describe("session - record by exploration", () => {
        let webSiteId : string | undefined;
        let sessionId : string | undefined;

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
                    webSiteId = typeof id === 'string' ? id : undefined;
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

                sessionId = typeof createdSessionId === 'string' ? createdSessionId : undefined;
            });
        });
        it("should get the created session", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(0);
            });
        });

        it("should update the session", () => {
            const url = SESSION_URL + "update";
            const body = {
                sessionId: sessionId,
                webSiteId: webSiteId,
                baseURL: "http://www.test.com/index.html",
                name:"testsessionupdated",
                description: "test updated",
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
            .then((updatedSessionId) => {
                // tslint:disable-next-line: no-unused-expression
                expect(updatedSessionId).to.not.be.undefined;
                // tslint:disable-next-line: no-unused-expression
                expect(updatedSessionId).to.not.be.null;
            });
        });

        it("should add an exploration to the session", () => {
            const url = SESSION_URL + sessionId + "/exploration/add";
            const body = {
                testerName: "superTester",
                interactionList: [
                    {index: 0, concreteType: "Action", kind: "add", value: "5"},
                    {index: 1, concreteType: "Observation", kind: "bug", value: "important"},
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
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(1);
                expect(sessionCasted.explorationList[0].interactionList.length).to.equal(3);
            });
        });

    });

    describe("session - record by exploration", () => {
        let webSiteId : string | undefined;
        let sessionId : string | undefined;
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
                    webSiteId = typeof id === 'string' ? id : undefined;
                })
        });

        it("should create an new session", () => {
            const url = SESSION_URL + "create";
            const body = {
                webSiteId: webSiteId,
                baseURL: "http://www.test.com/index.html",
                name:"testsession",
                description: "test",
                overlayType: "rainbow",
                recordingMode: "byinteraction"
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

                sessionId = typeof createdSessionId === 'string' ? createdSessionId : undefined;
            });
        });

        it("should get the created session", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(0);
            });
        });

        it("should add an empty exploration to the session", () => {
            const url = SESSION_URL + sessionId + "/exploration/add";
            const body = {
                testerName: "superTester",
                interactionList: [
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

        it("should add new actions to the exploration", () => {
            const AddInteractionsURL = `${SESSION_URL}${sessionId}/exploration/${0}/pushActionList`;
            const interactionList = [
                {index: 0, concreteType: "Action", kind: "add", value: "5"},
                {index: 1, concreteType: "Observation", kind: "bug", value: "important"},
                {index: 2, concreteType: "Action", kind: "remove", value: "3"},
            ];
            let option = {
                method: 'POST',
                body:    JSON.stringify({interactionList}),
                headers: { 'Content-Type': 'application/json' },
            }

            return fetch(AddInteractionsURL, option)
            .then((res) => {                
                expect(res.ok).to.eql(true)
            })

        });

        it("should get the created exploration", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(1);
                expect(sessionCasted.explorationList[0].interactionList.length).to.equal(3);
            });
        });
    });
    describe("session - record by exploration", () => {
        let webSiteId : string | undefined;
        let sessionId : string | undefined;
        before(() => {
            const url = WEBSITE_URL + "create";
            const body = {
                name: "test3",
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
                    webSiteId = typeof id === 'string' ? id : undefined;
                })
        });

        it("should create an new session", () => {
            const url = SESSION_URL + "create";
            const body = {
                webSiteId: webSiteId,
                baseURL: "http://www.test.com/index.html",
                name:"testsession",
                description: "test",
                overlayType: "rainbow",
                recordingMode: "byinteraction"
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

                sessionId = typeof createdSessionId === 'string' ? createdSessionId : undefined;
            });
        });

        it("should get the created session", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test3");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(0);
            });
        });

        it("should add an empty exploration to the session", () => {
            const url = SESSION_URL + sessionId + "/exploration/add";
            const body = {
                testerName: "superTester",
                interactionList: [
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

        it("should get the created session with one interaction", () => {
            const url = SESSION_URL + sessionId;
            return fetch(url, {})
            .then((res) => {
                return res.json();
            })
            .then((session) => {
                let sessionCasted = session as any;
                expect(sessionCasted.webSite.name).to.equal("test3");
                expect(sessionCasted.baseURL).to.equal("http://www.test.com/index.html");
                expect(sessionCasted.explorationList.length).to.equal(1);
            });
        });

        it("should remove the exploration to the session", () => {
            const explorationNumber = 0;
            const url = SESSION_URL + sessionId + `/exploration/${explorationNumber}/remove`;
            const body = {
            };
            const option = {
                method: "POST",
                body:    JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            };
            return fetch(url, option)
                .then((res) => {
                    const urlGet = SESSION_URL + sessionId;
                    return fetch(urlGet, {})
                })
                .then((res) => {
                    return res.json();
                })
                .then((session) => {
                    let sessionCasted = session as any;
                    expect(sessionCasted.explorationList.length).to.equal(1);
                    expect(sessionCasted.explorationList[0].isRemoved).to.equal(true);
                });
        });
    });
});
