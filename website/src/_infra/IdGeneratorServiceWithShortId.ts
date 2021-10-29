import { generate } from "shortid";
import IdGeneratorService from "../domain/IdGeneratorService";

export default class IdGeneratorServiceWithShortId implements IdGeneratorService {
    generateId() : string {
        return generate();
    }
}