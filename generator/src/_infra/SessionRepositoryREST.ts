import fetch from "node-fetch";
import config from "./config";
import SessionRepository from "../domain/SessionRepository";
import Session from "../domain/Session";
import Action from "../domain/Action";

const URL = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionRepositoryREST implements SessionRepository {

    public findSessionById(sessionId: string): Promise<Session | undefined> {
        const route = URL + sessionId;
        return fetch(route)
            .then( (response: any) => {
                return response.json();
            })
            .then( (sessionData: any) => {
                let explorations : Array<Array<Action>> = sessionData.explorationList.map((exploration : any, explorationNumber : any) => {
                    let interactions : Action[] = exploration.interactionList
                        .filter((interaction: any) => interaction.concreteType ==="Action")
                        .map((interaction : any) => {
                            return new Action(interaction.kind, interaction.value);
                        });
                    return interactions;
                });
                return new Session(sessionData.id, sessionData.baseURL, sessionData.name, explorations);
            });
    }
}