import chai from "chai";
import "mocha";
import Mapping from "../../src/domain/Mapping";
import WebSite from "../../src/domain/WebSite";
import IdGeneratorServiceWithShortId from "../../src/_infra/IdGeneratorServiceWithShortId";

const expect = chai.expect;
const idGeneratorService = new IdGeneratorServiceWithShortId();

describe("WebSite", () => {

    it("should store name, and mappingList should be empty", () => {
        const m = new WebSite(idGeneratorService, "site");
        expect(m.name).to.equal("site");
        expect(m.mappingList).to.have.lengthOf(0);
    });

    it("should add a mapping with mapping object", () => {
        const m = new WebSite(idGeneratorService, "site");
        const mapping: Mapping = {
            match: {
                event: "click",
                css: "body",
            },
            output: {
                prefix: "click",
            },
        };
        m.addMapping(mapping);
        expect(m.mappingList).to.have.lengthOf(1);
    });

    it("should add mappingList", () => {
        const m = new WebSite(idGeneratorService, "site");
        m.addMappingList([{
            match: {
                event: "click",
                css: "body",
            },
            output: {
                prefix: "click",
            },
            description: "Click on the body of the webpage"
        }]);
        expect(m.mappingList).to.have.lengthOf(1);
    });
});
