
import chai from "chai";
import * as fs from "fs";
import mocha from "mocha";
import * as path from "path";
import PrintService from "../../src/application/PrintService";
import Action from "../../src/domain/Action";
import Mapping from "../../src/domain/Mapping";
import Session from "../../src/domain/Session";
import WebSite from "../../src/domain/WebSite";
import InMemorySessionRepository from "../InMemorySessionRepository";

const expect = chai.expect;

const actionsRulesFile = path.join(__dirname, "../ressources/actionRules.json");
const assertRulesFile = path.join(__dirname, "../ressources/assertRules.json");

const outputFileDir = path.join(__dirname, "./generatedTestScripts");
const mappingFolder = path.join(__dirname, "..", "mappings");

const PUPPETEER_TIMEOUT = 15000;
const PUPPETEER_HEADLESS = true;

const URL = "https://cdiscount.com";
const repository = new InMemorySessionRepository();
const application = new PrintService(repository);

const websiteCDiscount = new WebSite("cdiscount", "cdiscount", "^.*cdiscount.*$");
const data = JSON.parse(fs.readFileSync(path.join(mappingFolder, "cdiscount.json" ), "utf8"));
data.forEach((mappingData) => {
    const mapping = new Mapping(mappingData.match, mappingData.output);
    websiteCDiscount.addMapping(mapping);
});

describe("EmptyTestScript", () => {
   const session = new Session("id0", URL);
   session.webSite = websiteCDiscount;
   repository.addSession(session);
   it ("should create a test script with no action", () => {
    return application.printPuppeteerSession(session.id).then((code) => {
        expect(code).to.not.eql(null);
        expect(code).to.not.eql(undefined);
        fs.writeFileSync(path.join(outputFileDir, "emptyScriptTest.js"), code);
    });
   });

});

describe("PuppeteerCodeBuilder Actions", () => {

    it("should create click action", () => {
        const session = new Session("id1", URL);
        session.webSite = websiteCDiscount;
        repository.addSession(session);
        const explorationNumber = session.startExploration();
        session.addActionToExploration(explorationNumber, new Action("start"));
        session.addActionToExploration(explorationNumber, new Action("SearchClick"));

        return application.printPuppeteerSession(session.id, {headless: false}).then((code) => {
            fs.writeFileSync(path.join(outputFileDir, "clickScriptTest.js"), code);
        });
    });

    it("should create type action", () => {
        const session = new Session("id2", URL);
        session.webSite = websiteCDiscount;
        repository.addSession(session);
        const explorationNumber = session.startExploration();
        session.addActionToExploration(explorationNumber, new Action("start"));
        session.addActionToExploration(explorationNumber, new Action("Search", "smartphone"));
        return application.printPuppeteerSession(session.id, {headless: false}).then((code) => {
            fs.writeFileSync(path.join(outputFileDir, "typeScriptTest.js"), code);
        });
    });

    it("should create select action", () => {
        const session = new Session("id3", URL);
        session.webSite = websiteCDiscount;
        repository.addSession(session);
        const explorationNumber = session.startExploration();
        session.addActionToExploration(explorationNumber, new Action("start"));
        session.addActionToExploration(explorationNumber, new Action("Search", "smartphone"));
        session.addActionToExploration(explorationNumber, new Action("ChangeSortMode", "BESTSALES"));

        return application.printPuppeteerSession(session.id, {headless: false}).then((code) => {
            fs.writeFileSync(path.join(outputFileDir, "selectScriptTest.js"), code);
        });
    });

    it("should create mouse hover action", () => {
        const session = new Session("id4", URL);
        session.webSite = websiteCDiscount;
        repository.addSession(session);
        const explorationNumber = session.startExploration();
        session.addActionToExploration(explorationNumber, new Action("start"));
        session.addActionToExploration(explorationNumber, new Action("Search", "smartphone"));
        session.addActionToExploration(explorationNumber, new Action("ItemPictureClick", "1"));
        session.addActionToExploration(explorationNumber, new Action("pictureover", "1"));

        return application.printPuppeteerSession(session.id, {headless: false}).then((code) => {
            fs.writeFileSync(path.join(outputFileDir, "hoverScriptTest.js"), code);
        });
    });

});
/*
describe("PuppeteerCodeBuilder Asserts", () => {

    describe("Import assert file", () => {

    });

    describe("Use undefined Assert", () => {

    });

    describe("Usage Asserts", () => {

    });

});*/
