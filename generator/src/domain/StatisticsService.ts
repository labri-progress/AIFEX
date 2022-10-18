import Action from "./Action";
import Session from "./Session";

export function actionsStatistics(session: Session): Map<Action, number> {
    const statistics: Map<Action, number> = new Map();
    session.explorations.forEach(exploration => {
        exploration.forEach(action => {
            const currentOccurence = statistics.get(action);
            if ( currentOccurence !== undefined) {
                statistics.set(action, currentOccurence + 1);
            } else {
                statistics.set(action, 1);
            }
        });
    });
    return statistics;
}