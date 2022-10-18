import config from "./config";
import fetch from "node-fetch";

import { logger } from "../logger";
import GeneratorService from "../domain/GeneratorService";

const GENERATOR_URL : string = `http://${config.generator.host}:${config.generator.port}/generator/`;

export default class GeneratorServiceHTTP implements GeneratorService {

    generateTest(sessionId: string): Promise<string | undefined> {
        const generatorGETURL = `${GENERATOR_URL}session/${sessionId}/all-actions`;
        return fetch(generatorGETURL).then(response => {
            if (response.ok) {
                return response.json().then(generatorData => {
                    return generatorData.tests;
                })
            } else {
                return undefined;
            }
        })
    }        
}
