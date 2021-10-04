import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import Comment from "../../src/domain/Comment";
import Session from "../../src/domain/Session";
import Tester from "../../src/domain/Tester";
import WebSite from "../../src/domain/WebSite";
import ActionInteraction from "../../src/domain/ActionInteraction";
import CommentInteraction from "../../src/domain/CommentInteraction";

const BASE_URL = "http://mywebsite.com";

describe("Domain - Session", () => {

    const anonymousTester = new Tester("anonymous");
    let webSite = new WebSite("id", "cdiscount");

    describe("session and exploration creation", () => {

        describe("create session and add exploration", () => {
            let explorationNumber : number;
            let session : Session;

            it("should build a Session", () => {
                session = new Session(undefined, webSite, BASE_URL, "MySession", "do it", undefined, undefined );
                expect(session.webSite.name).to.equal("cdiscount");
            });
            it("should start an exploration", () => {
                explorationNumber = session.startExploration(anonymousTester);
                expect(session.numberOfExploration).to.equal(1);

            });
            it("should get last action, it should be empty ", () => {
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.equal(0);
            });
        });
        describe("Adding actions in an exploration", () => {
            const session = new Session(undefined, webSite, BASE_URL, "MySession", "do it", undefined, undefined );
            const action = new Action("clickButton");

            let explorationNumber;

            it("should fail to add an action to a not created exploration", () => {
                session.startExploration(anonymousTester);
                try {
                    // tslint:disable-next-line: no-magic-numbers
                    session.addActionToExploration(99, action);
                    expect.fail("should have failed");
                } catch (e) {
                    if (e instanceof Error) {
                        expect(e.message).to.eql("cannot add action to exploration, wrong explorationNumber.");
                    } else {
                        expect.fail("incorrect error");
                    }
                }
            });

            it("should add an action with no value to an exploration", () => {
                explorationNumber = session.startExploration(anonymousTester);
                session.addActionToExploration(explorationNumber, action);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                // tslint:disable-next-line: no-magic-numbers
                expect(interactionList.length).to.equal(1);
                expect((<ActionInteraction>interactionList[0]).action.kind).to.equal("clickButton");
                // tslint:disable-next-line: no-unused-expression
                expect((<ActionInteraction>interactionList[0]).action.value).to.be.undefined;
            });

            it("should add an action with value to an exploration", () => {
                explorationNumber = session.startExploration(anonymousTester);
                session.addActionToExploration(explorationNumber,  new Action("clickButton", "toto"));
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                // tslint:disable-next-line: no-magic-numbers
                expect(interactionList.length).to.equal(1);
                expect((<ActionInteraction>interactionList[0]).action.kind).to.equal("clickButton");
                expect((<ActionInteraction>interactionList[0]).action.value).to.equal("toto");
            });

        });

        describe("Adding comment in an exploration", () => {
            const session = new Session(undefined, webSite, BASE_URL, "MySession", "do it", undefined, undefined );
            const action1 = new Action("action1");
            const action2 = new Action("action2");
            const comment1 = new Comment("bug", "first");
            const comment2 = new Comment("bug", "second");
            const comment3 = new Comment("bug", "third");

            const explorationNumber = session.startExploration(anonymousTester);
            session.addActionToExploration(explorationNumber, action1);

            it("should add a comment to an exploration", () => {
                session.addCommentToExploration(explorationNumber, comment1);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(2);
                expect(interactionList[0] instanceof ActionInteraction).to.be.true;
                expect(interactionList[1] instanceof CommentInteraction).to.be.true;
            });

            it("should add a second comment to an exploration", () => {
                session.addCommentToExploration(explorationNumber, comment2);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(3);
                expect((<CommentInteraction>interactionList[2]).comment).to.equal(comment2);
            });

            it("should add a comment on a new action", () => {
                session.addActionToExploration(explorationNumber, action2);
                session.addCommentToExploration(explorationNumber, comment3);

                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(5);
                expect((<CommentInteraction>interactionList[4]).comment).to.equal(comment3);
            });
        });

    });

});
