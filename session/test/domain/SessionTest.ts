import chai from "chai";
const expect = chai.expect;
import "mocha";
import Action from "../../src/domain/Action";
import Observation from "../../src/domain/Observation";
import Session from "../../src/domain/Session";
import Tester from "../../src/domain/Tester";
import WebSite from "../../src/domain/WebSite";
import ActionInteraction from "../../src/domain/ActionInteraction";
import ObservationInteraction from "../../src/domain/ObservationInteraction";

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
            const action = new ActionInteraction(0, new Action("clickButton"), new Date());

            let explorationNumber;

            it("should fail to add an action to a not created exploration", () => {
                session.startExploration(anonymousTester);
                try {
                    // tslint:disable-next-line: no-magic-numbers
                    session.addInteractionListToExploration(99, [action]);
                    expect.fail("should have failed");
                } catch (e) {
                    if (e instanceof Error) {
                        expect(e.message).to.eql("cannot add interaction to exploration, wrong explorationNumber.");
                    } else {
                        expect.fail("incorrect error");
                    }
                }
            });

            it("should add an action with no suffix to an exploration", () => {
                explorationNumber = session.startExploration(anonymousTester);
                session.addInteractionListToExploration(explorationNumber, [action]);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                // tslint:disable-next-line: no-magic-numbers
                expect(interactionList.length).to.equal(1);
                expect((<ActionInteraction>interactionList[0]).action.prefix).to.equal("clickButton");
                // tslint:disable-next-line: no-unused-expression
                expect((<ActionInteraction>interactionList[0]).action.suffix).to.be.undefined;
            });

            it("should add an action with suffix to an exploration", () => {
                explorationNumber = session.startExploration(anonymousTester);
                session.addInteractionListToExploration(explorationNumber, [new ActionInteraction(1, new Action("clickButton", "toto"), new Date())]);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                // tslint:disable-next-line: no-magic-numbers
                expect(interactionList.length).to.equal(1);
                expect((<ActionInteraction>interactionList[0]).action.prefix).to.equal("clickButton");
                expect((<ActionInteraction>interactionList[0]).action.suffix).to.equal("toto");
            });

        });

        describe("Adding observation in an exploration", () => {
            const session = new Session(undefined, webSite, BASE_URL, "MySession", "do it", undefined, undefined );
            const action1 = new ActionInteraction(1,new Action("action1"));
            const action2 = new ActionInteraction(2,new Action("action2"));
            const observation1 = new Observation("bug", "first");
            const observation2 = new Observation("bug", "second");
            const observation3 = new Observation("bug", "third");

            const explorationNumber = session.startExploration(anonymousTester);
            session.addInteractionListToExploration(explorationNumber, [ action1]);

            it("should add a observation to an exploration", () => {
                session.addObsersationToExploration(explorationNumber, observation1);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(2);
                expect(interactionList[0] instanceof ActionInteraction).to.be.true;
                expect(interactionList[1] instanceof ObservationInteraction).to.be.true;
            });

            it("should add a second observation to an exploration", () => {
                session.addObsersationToExploration(explorationNumber, observation2);
                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(3);
                expect((<ObservationInteraction>interactionList[2]).observation).to.equal(observation2);
            });

            it("should add a observation on a new action", () => {
                session.addInteractionListToExploration(explorationNumber, [action2]);
                session.addObsersationToExploration(explorationNumber, observation3);

                const interactionList = session.getInteractionListOfExploration(explorationNumber);
                expect(interactionList.length).to.eql(5);
                expect((<ObservationInteraction>interactionList[4]).observation).to.equal(observation3);
            });
        });

    });

});
