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
                if (stats.size > 0) {
                    const eg = new EventGraph();
                    session.explorations.forEach((exploration) => eg.addExploration(exploration));
                    logger.debug(`the EventGraph has ${eg.actions.size} actions`);

                    let totalOccurence= 0;
                    stats.forEach((stat) => {totalOccurence += stat});
                    const actionsSorted = (new Array(...stats.entries())).sort((a, b) => a[1] - b[1]).map(([ac,nu]) => ac);
                    logger.debug(`there are ${actionsSorted.length} actions`);
                    
                    const actionsToCover : Action[] = []
                    let currentCoverageInPercent = 0;
                    actionsSorted.forEach((action) => {
                        const actionStat = stats.get(action);
                        if (actionStat) {
                            const THRESHOLD = 0.8; // 80% of the actions (occurences)
                            if (((currentCoverageInPercent + actionStat) / totalOccurence)  < 0.8) {
                                currentCoverageInPercent += actionStat;
                                actionsToCover.push(action);
                            }
                        }
                    });
                    logger.debug(`there are ${actionsToCover.length} actions to cover`);

                    const tests : Action[][] = [];
                    actionsToCover.forEach((action) => {
                        const path = eg.shortPathToTarget(action);
                        logger.debug(`the path is ${path.map((a) => `${a.kind}$${a.value?.split('?href')[0]}` ).join(' -> ')}`);
                        tests.push(path);
                    });
                    logger.debug(`there are ${tests.length} tests`);

                    logger.debug(`now we minimize`);
                    return minimizeTests(tests, actionsToCover);
                } else {
                    return Promise.resolve([]);
                }
            });
    }
    
}
