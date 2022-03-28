import fetch from "node-fetch";
import config from "./config";
import Action from "../domain/Action";
import ActionInteraction from "../domain/ActionInteraction";
import Observation from "../domain/Observation";
import ObservationInteraction from "../domain/ObservationInteraction";
import Mapping from "../domain/Mapping";
import Session from "../domain/Session";
import SessionRepository from "../domain/SessionRepository";
import WebSite from "../domain/WebSite";

const WebSiteURL: string = `http://${config.website.host}:${config.website.port}/website/`;
const SessionURL: string = `http://${config.session.host}:${config.session.port}/session/`;

export default class SessionRepositoryREST implements SessionRepository {
    public webSiteName: string | undefined;

    public findSessionById(sessionId: string): Promise<Session | undefined> {
        const sessionFetch: string = SessionURL + sessionId;
        return fetch(sessionFetch)
        .then( (response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return Promise.reject("findSessionSite REST error");
            }
        })
        .then( (sessionData : {
            id: string,
            baseURL: string,
            webSite: {
                id: string
            }
            explorationList: {
                interactionList: {
                    concreteType: string,
                    index: number,
                    kind: string,
                    value: string | undefined
                }[]
            }[]
        }) => {
            const session = new Session(sessionData.id, sessionData.baseURL);
            sessionData.explorationList.forEach((explorationData) => {
                const explorationNumber: number = session.startExploration();
                const interactionList = explorationData.interactionList
                .sort( (interA, interB) => interA.index - interB.index)
                .map((interaction) => {
                    if (interaction.concreteType === "Action") {
                        return new ActionInteraction(interaction.index, new Action(interaction.kind, interaction.value));
                    }
                    if (interaction.concreteType === "Observation" && interaction.value !== undefined) {
                        return new ObservationInteraction(interaction.index, new Observation(interaction.kind, interaction.value));
                    }
                })
                .filter( (interaction): interaction is ActionInteraction | ObservationInteraction => interaction !== undefined) ;
                session.addInteractionListToExploration(explorationNumber, interactionList);
            });

            const websiteFetch: string = WebSiteURL + sessionData.webSite.id;
            return fetch(websiteFetch)
                .then( (response) => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        return Promise.reject("findWebSite REST error");
                    }
                })
                .then((webSiteData : {
                    id: string,
                    name: string,
                    url: string,
                    mappingList: any[]

                }) => {
                    const webSite = new WebSite(webSiteData.id, webSiteData.name);
                    webSiteData.mappingList.forEach((mappingData) => {
                        webSite.addMapping(new Mapping(mappingData.match, mappingData.output));
                    });
                    session.webSite = webSite;
                    return session;
                });
        });
    }

}
