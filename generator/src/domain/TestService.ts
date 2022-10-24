import Action from "./Action";
import Session from "./Session";
import { getAllActions } from "./StatisticsService";


export function computeMinimalExplorationsCoveringAllActions(session: Session): Action[][] {
    let actionsToCover = getAllActions(session);
    let explorations = session.explorations;
    const minimalExplorations: Action[][] = [];
    while (actionsToCover.length > 0) {
        const roundResults = minimizationRound(explorations, actionsToCover);
        minimalExplorations.push(roundResults.test);
        actionsToCover = roundResults.lastingActions;
        explorations = roundResults.lastingTests;
    }
    return minimalExplorations;
}

export function minimizeTests(tests: Action[][], actionsToCover: Action[]): Action[][] {
    let testToMinimize = tests;
    const minimizedTests: Action[][] = [];
    while (actionsToCover.length > 0) {
        const roundResults = minimizationRound(testToMinimize, actionsToCover);
        minimizedTests.push(roundResults.test);
        actionsToCover = roundResults.lastingActions;
        testToMinimize = roundResults.lastingTests;
    }
    return minimizedTests;
}

export function computeCoverageScore(test: Action[], actionsToCover: Action[]): number {
    let score = 0;
    if (test.length !== 0) {
        const BONUS_MULTI_COVERED_ACTIONS = 1.20;
        actionsToCover.forEach(action => {
            if (test.some((testAction) => sameAction(testAction, action))) {
                score += 1;
                score = score * BONUS_MULTI_COVERED_ACTIONS;
            }
        });
        score = score / test.length;
    }
    return score;
}

export function minimizationRound(tests: Action[][], actionsToCover: Action[]): {test: Action[], lastingTests: Action[][], lastingActions: Action[]} {
    if (tests.length === 0) {
        return {test: [], lastingTests: tests, lastingActions: actionsToCover};
    } else {
        const scores = tests.map(exploration => computeCoverageScore(exploration, actionsToCover));
        const maxScore = Math.max(...scores);
        const indexOfMaxScore = scores.indexOf(maxScore);
        const test = tests[indexOfMaxScore];
        const lastingTests = tests.filter((test, index) => index !== indexOfMaxScore);
        const lastingActions = actionsToCover.filter(action => !test.some(testAction => sameAction(testAction,action)));
        return {test, lastingTests, lastingActions};
    }
}

function sameAction(action1: Action, action2: Action): boolean {
    return actionKey(action1) === actionKey(action2);
}

function actionKey(action: Action) {
    let key = action.kind;
    if (action.value !== undefined) {
        key += '$' + action.value.split('?href')[0];
    }
    return key;
}

