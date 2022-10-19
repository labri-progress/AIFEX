import Action from "./Action";
import Session from "./Session";
import { getAllActions } from "./StatisticsService";


export function computeMinimalExplorationsCoveringAllActions(session: Session): Action[][] {
    let actionsToCover = getAllActions(session);
    let explorations = session.explorations;
    const minimalExplorations: Action[][] = [];
    while (actionsToCover.length > 0) {
        const roundResults = roundForMinimalExplorationsCoveringAllActions(explorations, actionsToCover);
        minimalExplorations.push(roundResults.explorationToKeep);
        actionsToCover = roundResults.lastActionsToCover;
        explorations = roundResults.lastExplorations;
    }
    return minimalExplorations;
}

export function computeCoverageScore(exploration: Action[], actionsToCover: Action[]): number {
    let score = 0;
    if (exploration.length !== 0) {
        actionsToCover.forEach(action => {
            if (exploration.includes(action)) {
                score += 1;
            }
        });
        score = score / exploration.length;
    }
    return score;
}

export function roundForMinimalExplorationsCoveringAllActions(explorations: Action[][], actionsToCover: Action[]): {explorationToKeep: Action[], lastExplorations: Action[][], lastActionsToCover: Action[]} {
    if (explorations.length === 0) {
        return {explorationToKeep: [], lastExplorations: explorations, lastActionsToCover: actionsToCover};
    } else {
        const scores = explorations.map(exploration => computeCoverageScore(exploration, actionsToCover));
        const maxScore = Math.max(...scores);
        const indexOfMaxScore = scores.indexOf(maxScore);
        const explorationToKeep = explorations[indexOfMaxScore];
        const lastExplorations = explorations.filter((exploration, index) => index !== indexOfMaxScore);
        const lastActionsToCover = actionsToCover.filter(action => !explorationToKeep.includes(action));
        return {explorationToKeep, lastExplorations, lastActionsToCover};
    }
}