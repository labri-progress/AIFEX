import Action from "./Action";
import Session from "./Session";

export function  computeActionsStatistics(session: Session): Map<Action, number> {
    const keysToAction: Map<string, Action> = new Map();
    const keysToOccurences: Map<string, number> = new Map();
    session.explorations.forEach(exploration => {
        exploration.forEach(action => {
            const actionInMap = keysToAction.get(action.key);
            const currentOccurence = keysToOccurences.get(action.key);
            if ( actionInMap !== undefined && currentOccurence !== undefined) {
                keysToOccurences.set(action.key, currentOccurence + 1);
            } else {
                keysToAction.set(action.key, action);
                keysToOccurences.set(action.key, 1);
            }
        });
    });
    const result = new Map<Action, number>();
    keysToAction.forEach((action, key) => {
        const occurence = keysToOccurences.get(key);
        if (occurence !== undefined) {
            result.set(action, occurence);
        }
    });
    return result;
}

export function getAllActions(session: Session): Action[] {
    const actions: Action[] = [];
    const keys: string[] = [];
    session.explorations.forEach(exploration => {
        exploration.forEach(action => {
            if (!keys.includes(action.key)) {
                actions.push(action);
                keys.push(action.key);
            }
        });
    });
    return actions;
}