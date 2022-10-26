import Action from "../domain/Action";
import EventGraph from "../domain/EventGraph";
import SessionRepository from "../domain/SessionRepository";
import { computeActionsStatistics } from "../domain/StatisticsService";
import { computeMinimalExplorationsCoveringAllActions, minimizeTests } from "../domain/TestService";
import { logger } from "../logger";

export default class GeneratorService {
    public sessionRepository: SessionRepository;

    constructor(sessionRepository : SessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public createTestsThatCoverAllActions(sessionId: string): Promise<Action[][] | undefined> {
        return this.sessionRepository.findSessionById(sessionId)
            .then((session) => {
                if (session === undefined) {
                    return Promise.resolve(undefined);
                }
                const stats = computeActionsStatistics(session);
                const actionsSorted = (new Array(...stats.entries())).sort((a, b) => a[1] - b[1]).map(([ac,nu]) => ac);
                if (actionsSorted.length > 0) {
                    logger.debug(`there are ${actionsSorted.length} actions`);
                    logger.debug(`the first one is ${actionsSorted[0].kind}`);
                    logger.debug(`the second one is ${actionsSorted[1].kind}`);
                    const eg = new EventGraph();
                    session.explorations.forEach((exploration) => eg.addExploration(exploration));
                    logger.debug(`the EventGraph has ${eg.actions.size} actions`);
                    const tests : Action[][] = [];
                    const MAX_NB_ACTIONS = 4;
                    const actionsToCover = actionsSorted.slice(0, MAX_NB_ACTIONS)
                    logger.debug(`there are ${actionsToCover.length} actions to cover`);
                    actionsToCover.forEach((action) => {
                        const path = eg.shortPathToTarget(action);
                        logger.debug(`the path is ${path.map((a) => `${a.kind}$${a.value?.split('?href')[0]}` ).join(' -> ')}`);
                        tests.push(path);
                    });
                    logger.debug(`now we minimize`);
                    return minimizeTests(tests, actionsToCover);
                } else {
                    return Promise.resolve([]);
                }
            });
    }
    
}
