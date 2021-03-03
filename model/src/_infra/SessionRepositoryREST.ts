import fetch from "node-fetch";
import config from "./config";
import Note from "../domain/Note";
import Sequence from "../domain/Sequence";
import SessionRepository from "../domain/SessionRepository";
import Stimulus from "../domain/Stimulus";

const URL = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionRepositoryREST implements SessionRepository {

    public fetchSequenceListOfSession(sessionId: string): Promise<{sequence: Sequence, sessionId: string, explorationKey: string}[]> {
        const route = URL + sessionId;
        return fetch(route)
            .then( (response) => {
                return response.json();
            })
            .then( (session) => {
                return session.explorationList.map((exploration : any, explorationNumber : any) => {
                    const seq = new Sequence();

                    exploration.interactionList.forEach((interaction : any) => {
                        let value;
                        if (interaction.value === undefined) {
                            value = interaction.kind;
                        } else {
                            value = interaction.kind + "$" + interaction.value;
                        }
                        if (interaction.concreteType === "Action") {
                            seq.addStimulus(new Stimulus(value));
                        } else if (interaction.concreteType === "Comment") {
                            seq.addNote(new Note(value));
                        }
                    });
                    return {
                        sequence : seq,
                        sessionId,
                        explorationKey: explorationNumber,
                    };
                });
            });
    }
}