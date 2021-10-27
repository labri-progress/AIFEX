import chai from "chai";
const expect = chai.expect;
import "mocha";
import fetch from "node-fetch";

const API_URL = "http://localhost/api";

describe("API", () => {

    // tslint:disable-next-line: prefer-const
    let token;
    let webSiteId;
    let sessionId;
    let modelId;

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
            username:"testAPI",
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
            username:"testAPI",
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
                expect(json.bearerToken).to.not.be.undefined;
                token = json.bearerToken;
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
                expect(account.username).eql("testAPI");
                expect(account.authorizationSet.length).eql(1);
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
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.webSiteId).to.not.be.undefined;
                webSiteId = result.webSiteId;
            });
    });

    it("should have the webSite in the account", () => {
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
                expect(account.authorizationSet.length).eql(2);
                expect(account.authorizationSet[1].kind).to.be.eql("WebSite");
                expect(account.authorizationSet[1].key).to.be.eql(webSiteId);
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
                "Authorization": `Bearer ${token}`}
            })
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.be.eql("WebSiteUpdated");                
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
            })})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.sessionId).to.be.not.undefined;
                sessionId = result.sessionId;
            });
    });


    it("should have the session in the account", () => {
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
                expect(account.authorizationSet.length).eql(3);
                expect(account.authorizationSet[2].kind).to.be.eql("Session");
                expect(account.authorizationSet[2].key).to.be.eql(sessionId);
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
            })})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.modelId).to.be.not.undefined;
                modelId = result.modelId;
            });
    });


    it("should link the model to the session", () => {
        const url = `${API_URL}/models/${modelId}/link/${sessionId}`;
        return fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.be.eql("ModelLinkedToSession");
            });
    });

    it("should add an exploration to the session",() => {
        const url = `${API_URL}/sessions/${sessionId}/explorations`;
        const body = {
            testerName: "testAPI",
            interactionList: [
                {index: 0, concreteType: "Action", kind: "start"},
                {index: 1, concreteType: "Action", kind: "click", value: "value"},
                {index: 2, concreteType: "Action", kind: "click", value: "value"},
            ]
        };
        return fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.explorationNumber).to.be.eql(0);
            });
    });

    it("should compute the probabilities", () => {
        const url = `${API_URL}/models/${modelId}/probabilities`;
        const body = {
            interactionList: [
                {index: 0, concreteType: "Action", kind: "start"},
            ]
        }
        return fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)})
            .then(res => {
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then(resJson => {
                const probaMap = resJson.probabilities;
                expect(probaMap).lengthOf(1);
                expect(probaMap[0]).lengthOf(2);
                expect(probaMap[0][0]).to.eql("click$value");
                expect(probaMap[0][1]).to.eql(1);
    
            });
    });

    it("should add interactions to the exploration",() => {
        const url = `${API_URL}/sessions/${sessionId}/explorations/${0}/interactions`;
        const body = {
            testerName: "testAPI",
            interactionList: [
                {index: 3, concreteType: "Action", kind: "type", value: "value"},
            ]
        };
        return fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.sessionId).to.be.eql(sessionId);
            });
    });

    it("should remove the session", () => {
        const url = `${API_URL}/sessions/${sessionId}`;
        return fetch(url, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.be.eql("SessionRemoved");
            });
    });

    it("should remove the model", () => {
        const url = `${API_URL}/models/${modelId}`;
        return fetch(url, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.be.eql("ModelRemoved");
            });
    });

    it("should remove the webSite", () => {
        const url = `${API_URL}/websites/${webSiteId}`;
        return fetch(url, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }})
            .then(res => {
                // tslint:disable-next-line: no-unused-expression
                expect(res.ok).to.be.true;
                return res.json();
            })
            .then((result) => {
                expect(result.message).to.be.eql("WebSiteRemoved");
            });
    });
});
