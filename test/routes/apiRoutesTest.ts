import chai from "chai";
import fs from "fs";
const expect = chai.expect;
import "mocha";
import { dropAllDatabases } from "./databasesService";
import fetch from "node-fetch";
import FormData from "form-data";

const API_URL = "http://localhost/api";

before("Dropping database", async () => {
    await dropAllDatabases();
})

describe("API", () => {

    let token: string | undefined;
    let webSiteId: string | undefined;
    let sessionId: string | undefined;
    let modelId: string | undefined;

    it("should ping", () => {
        const url = `${API_URL}/ping`;
        return fetch(url)
            .then((res) => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.eql("alive");
            });
    });


    it("should signup", () => {
        const url = `${API_URL}/signup`;
        const body = {
            username: "testAPI",
            email: "test@test.com",
            password: "test"
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
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

    it("should not signup twice", () => {
        const url = `${API_URL}/signup`;
        const body = {
            username: "testAPI",
            email: "test@test.com",
            password: "test"
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        };
        return fetch(url, option)
            .then((res) => {
                expect(res.ok).to.be.false;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.eql("UserNameAlreadyTaken");
            });
    });

    it("should signin", () => {
        const url = `${API_URL}/signin`;
        const body = {
            username: "testAPI",
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
                expect(jsonCasted.bearerToken).to.not.be.undefined;
                token = jsonCasted.bearerToken;
            });
    });


    it("should not signin with a wrong password", () => {
        const url = `${API_URL}/signin`;
        const body = {
            username: "testAPI",
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
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("Unauthorized");
            });
    });

    it("should get the account", () => {
        const url = `${API_URL}/account`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((account) => {
                let accountCasted = account as any;
                expect(accountCasted.username).eql("testAPI");
                expect(accountCasted.authorizationSet.length).eql(4);
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
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.webSiteId).to.not.be.undefined;
                webSiteId = resultCasted.webSiteId;
            });
    });

    it("should have the webSite in the account", () => {
        const url = `${API_URL}/account`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((account) => {
                let accountCasted = account as any;
                expect(accountCasted.authorizationSet.length).eql(5);
                expect(accountCasted.authorizationSet[4].kind).to.be.eql("WebSite");
                expect(accountCasted.authorizationSet[4].key).to.be.eql(webSiteId);
            });
    });

    it("should update the webSite", () => {
        const url = `${API_URL}/websites/${webSiteId}`;
        const body = {
            name: "MyWebSiteUpdated",
            url: "http://mywebsiteupdated.com",
            mappingList: [
                {
                    match: {
                        event: "click",
                        css: "body"
                    },
                    output: {
                        prefix: "clickBody"
                    }
                }
            ]
        };
        return fetch(url, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("WebSiteUpdated");
            });
    });


    it("should create a new session", () => {
        const url = `${API_URL}/sessions`;
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                webSiteId: webSiteId,
                baseURL: "http://mywebsite.com",
                name: "MySession",
                description: "MySessionDescription",
                overlayType: "shadow",
                recordingMode: "byexploration"
            })
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.sessionId).to.be.not.undefined;
                sessionId = resultCasted.sessionId;
            });
    });


    it("should have the session in the account", () => {
        const url = `${API_URL}/account`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((account) => {
                let accountCasted = account as any;
                expect(accountCasted.authorizationSet.length).eql(6);
                expect(accountCasted.authorizationSet[5].kind).to.be.eql("Session");
                expect(accountCasted.authorizationSet[5].key).to.be.eql(sessionId);
            });
    });


    it("should update the session", () => {
        const url = `${API_URL}/sessions`;
        return fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId,
                webSiteId: webSiteId,
                baseURL: "http://mywebsite.com",
                name: "MySessionUpdated",
                description: "MySessionDescription",
                overlayType: "shadow",
                recordingMode: "byexploration"
            })
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.sessionId).to.be.not.undefined;
            });
    });


    it("should create a new model", () => {
        const url = `${API_URL}/models`;
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                depth: 3,
                interpolationfactor: 2,
                predictionType: "CSP"
            })
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.modelId).to.be.not.undefined;
                modelId = resultCasted.modelId;
            });
    });


    it("should link the model to the session", () => {
        const url = `${API_URL}/models/${modelId}/link/${sessionId}`;
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("ModelLinkedToSession");
            });
    });

    it("should add an exploration to the session", () => {
        const url = `${API_URL}/sessions/${sessionId}/explorations`;
        const body = {
            testerName: "testAPI",
            interactionList: [
                { index: 0, concreteType: "Action", kind: "start" },
                { index: 1, concreteType: "Action", kind: "click", value: "value" },
                { index: 2, concreteType: "Action", kind: "click", value: "value" },
            ]
        };
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.explorationNumber).to.be.eql(0);
            });
    });

    it("should compute the probabilities", () => {
        const url = `${API_URL}/models/${modelId}/probabilities`;
        const body = {
            interactionList: [
                { index: 0, concreteType: "Action", kind: "start" },
            ]
        }
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then(resJson => {
                let resJsonCasted = resJson as any;
                const probaMap = resJsonCasted.probabilities;
                expect(probaMap).lengthOf(1);
                expect(probaMap[0]).lengthOf(2);
                expect(probaMap[0][0]).to.eql("click$value");
                expect(probaMap[0][1]).to.eql(1);

            });
    });

    it("should add interactions to the exploration", () => {
        const url = `${API_URL}/sessions/${sessionId}/explorations/${0}/interactions`;
        const body = {
            testerName: "testAPI",
            interactionList: [
                { index: 3, concreteType: "Action", kind: "type", value: "value" },
            ]
        };
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.sessionId).to.be.eql(sessionId);
            });
    });

    it("should add a video to the exploration", () => {
        const url = `${API_URL}/sessions/${sessionId}/exploration/${0}/video`;
        const formData = new FormData();
        
        formData.append("video", fs.createReadStream('./video/test.mp4'));
        return fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        .then(res => {
            // tslint:disable-next-line: no-unused-expression
            expect(res.ok).to.be.true;
            return res.json();
        })
        .then((result) => {
            let resultCasted = result as any;
            expect(resultCasted.message).to.be.eql("VideoAdded");
        });
    })

    it("should get one video in the session", () => {
        const url = `${API_URL}/session/${sessionId}/explorations-with-video`;
        return fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.explorationNumbers.length).to.be.eql(1);
            });
    });

    it("should get the cross entropy of the session", () => {

        const url = `${API_URL}/models/cross_entropy/session/${sessionId}`;
        const body = {
            depth: 3,
            interpolationfactor: 2,
            predictionType: "CSP",
        };
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }).then((response) => {
            expect(response.ok).to.eql(true);
            return response.json();
        });
    });

    it("should get the session", () => {
        const url = `${API_URL}/sessions/${sessionId}`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.eql(true);
                return res.json();
            })
            .then((session) => {
                expect(session.name).to.be.eql("MySessionUpdated");
            })
    });

    it("should remove the exploration of the session", () => {
        const url = `${API_URL}/sessions/${sessionId}/explorations/0`;
        return fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
            });
    })

    it("should get the session with removed exploration", () => {
        const url = `${API_URL}/sessions/${sessionId}`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.eql(true);
                return res.json();
            })
            .then((session) => {
                expect(session.explorationList[0].isRemoved).to.be.true;
            })
    });

    it("should remove the session", () => {
        const url = `${API_URL}/sessions/${sessionId}`;
        return fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("SessionRemoved");
            })
    });

    it("should fail get the removed session", () => {
        const url = `${API_URL}/sessions/${sessionId}`;
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                const FORBIDDEN_STATUS = 403;
                expect(res.status).to.be.eql(FORBIDDEN_STATUS);
            })
    });


    it("should remove the model", () => {
        const url = `${API_URL}/models/${modelId}`;
        return fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("ModelRemoved");
            });
    });

    it("should remove the webSite", () => {
        const url = `${API_URL}/websites/${webSiteId}`;
        return fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                let resultCasted = result as any;
                expect(resultCasted.message).to.be.eql("WebSiteRemoved");
            });
    });

});
