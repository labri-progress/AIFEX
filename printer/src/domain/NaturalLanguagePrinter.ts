import Action from "./Action";
import ActionInteraction from "./ActionInteraction";
import ActionToMappingService from "./ActionToMappingService";
import Exploration from "./Exploration";
import IPrinter from "./IPrinter";
import Mapping from "./Mapping";
import Session from "./Session";

export default class NaturalLanguagePrinter implements IPrinter {

    public printSession(session: Session): string {
        return session.explorationList
            .map((exploration, index) => {
                return `Exploration Number ${index} \n` + this.printExploration(exploration, session);
            })
            .join("\n\n");
    }

    public printExploration(exploration: Exploration, session: Session): string {
        return exploration.interactionList
            .filter((interaction) => interaction instanceof ActionInteraction)
            .map((actionInteraction, index) => this.printAction((actionInteraction as ActionInteraction).action, session) + "\n")
            .join("");
    }

    public printAction(action: Action, session: Session): string | undefined {
        if (session.webSite) {
                const mapping = ActionToMappingService.findMappingForAction(action, session.webSite.mappingList);
            if (action.kind === "start") {
                return `start : (baseURL = ${session.baseURL})`;
            }
            if (action.kind === "end") {
                return `end`;
            }
            if (mapping === undefined) {
                throw new Error("No mapping found");
            }
            return `${action.kind} : ${this.printDetails(action, mapping)}`;
        }
    }

    public printDetails(action: Action, mapping: Mapping): string {
        let details = "";
        details += `(selector = ${mapping.match.css})`;
        if (mapping.output.suffix !== undefined) {
            details += `, (suffix = ${mapping.output.suffix} with ${action.value} as value)`;
        }
        return details;
    }
}
