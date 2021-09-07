import StepState, { transitionType } from "../domain/StepState";
export default class StepNFA {

    get isDFA(): boolean {
        for (const [src, transition] of this.transitions) {
            for (const [action, destinations] of transition) {
                if (action === transitionType.epsilon) {
                    return false;
                } else if (destinations.length > 1) {
                    return false;
                }
            }
        }
        return true;
    }

    public startState: StepState;
    public finalStates: StepState[];
    public transitions: Map<StepState, Map<string, StepState[]>>;
    public states: StepState[];

    constructor(start: StepState, finals: StepState[] = [], states: StepState[] = [], transitions: Map<StepState, Map<string, StepState[]>>= new Map()) {
        this.startState = start;
        this.finalStates = finals;
        this.states = states;
        this.transitions = transitions;
    }

    public isFinalState(state: StepState): boolean {
        return this.finalStates.some((final) => final === state);
    }

    public addTransition(src: StepState, dest: StepState, actionLabel: string): void {
        if (src === undefined) {
            throw new Error("transition src is undefined");
        } else if (dest === undefined) {
            throw new Error("transition dest is undefined");
        }
        if (this.transitions.has(src)) {
            const transitionsForSrc = this.transitions.get(src);
            if (transitionsForSrc) {
                if (transitionsForSrc.has(actionLabel)) {
                    const destinations = transitionsForSrc.get(actionLabel);
                    if (destinations && !destinations.includes(dest)) {
                        destinations.push(dest);
                    }
                } else {
                    transitionsForSrc.set(actionLabel, [dest]);
                }
            }
        } else {
            const destMap = new Map();
            destMap.set(actionLabel, [dest]);
            this.transitions.set(src, destMap);
        }
    }

    public or(rightNFA: StepNFA): Promise<StepNFA> {
        const startState = new StepState();
        const newTransitionMap = new Map();
        return rightNFA.copy().then((right) => {
            const orNFA = new StepNFA(startState,
                [...this.finalStates, ...right.finalStates],
                [...this.states, ...right.states, startState],
                newTransitionMap);

            for (const [src, transition] of [...this.transitions, ...right.transitions]) {
                for (const [action, destinations] of transition) {
                    for (const dest of destinations) {
                        orNFA.addTransition(src, dest, action);
                    }
                }
            }
            orNFA.addTransition(startState, this.startState, transitionType.epsilon);
            orNFA.addTransition(startState, right.startState, transitionType.epsilon);
            return orNFA;
        });
    }

    public arrow(right: StepNFA): Promise<StepNFA> {
        const loopState = new StepState();
        const newTransitionMap = new Map();
        return right.copy().then((rightNFA) => {
            const arrowNFA = new StepNFA(this.startState,
                rightNFA.finalStates,
                [...this.states, ...rightNFA.states, loopState],
                newTransitionMap);

            for (const [src, transition] of [...this.transitions, ...rightNFA.transitions]) {
                    for (const [action, destinations] of transition) {
                        for (const dest of destinations) {
                            arrowNFA.addTransition(src, dest, action);
                        }
                    }
            }
            arrowNFA.addTransition(loopState, loopState, transitionType.star);
            arrowNFA.addTransition(loopState, rightNFA.startState, transitionType.epsilon);

            this.finalStates.forEach((state) => {
                arrowNFA.addTransition(state, loopState, transitionType.epsilon);
            });
            return arrowNFA;
        });
    }

    public sequence(right: StepNFA): Promise<StepNFA> {
        const newTransitionMap = new Map();
        return right.copy().then((rightNFA) => {
            const seqNFA = new StepNFA(this.startState, rightNFA.finalStates, [...this.states, ...rightNFA.states], newTransitionMap);
            for (const [src, transition] of [...this.transitions, ...rightNFA.transitions]) {
                for (const [action, destinations] of transition) {
                    for (const dest of destinations) {
                        seqNFA.addTransition(src, dest, action);
                    }
                }
            }
            this.finalStates.forEach((state) => {
                    seqNFA.addTransition(state, rightNFA.startState, transitionType.epsilon);
                });
            return seqNFA;
        });

    }

    public negation(): Promise<StepNFA> {
        let getDFA;
        if (this.isDFA) {
            getDFA = this.copy();
        } else {
            getDFA = this.toDFA();
        }
        return getDFA.then((dfa) => {
            const negationNFA = new StepNFA(dfa.startState,
                dfa.states.filter((state) => !dfa.finalStates.some((final) => final === state)),
                dfa.states,
                dfa.transitions,
                );
            return negationNFA;
        });
    }

    public kleenPlus(): Promise<StepNFA> {
        return this.copy().then((iteratedNFA) => {
            const startState = iteratedNFA.startState;
            const endState = new StepState();
            const iterationState = new StepState();
            const transitions =  new Map([...iteratedNFA.transitions]);

            const NFA = new StepNFA(startState, [endState], [endState, iterationState, ...iteratedNFA.states], transitions);
            iteratedNFA.finalStates.forEach((iteratedNFAfinalState) => {
                NFA.addTransition(iteratedNFAfinalState, iterationState, transitionType.epsilon)
            });
            NFA.addTransition(iterationState, iterationState, transitionType.star);
            NFA.addTransition(iterationState, endState, transitionType.epsilon);
            NFA.addTransition(iterationState, startState, transitionType.epsilon);

            return NFA;
        })
    }

    public iteration(numberOfIteration: number): Promise<StepNFA> {
        const copyPromises = [];
        if (numberOfIteration === 0) {
            return this.negation();
        } else if (numberOfIteration === 1) {
            return Promise.resolve(this);
        } else {
            for (let i = 0; i < numberOfIteration; i++) {
                copyPromises.push(this.copy());
            }

            return Promise.all(copyPromises).then((copies) => {
                const finalState = new StepState();
                const iterationStates = [];
                for (let i=0; i < copies.length-1; i++) {
                    iterationStates.push(new StepState())
                }

                const transitions: any[] = copies.reduce((acc: any, copy: any) => [...copy.transitions, ...acc], []);

                const NFA = new StepNFA(
                    copies[0].startState,
                    [finalState],
                    copies.reduce((acc: StepState[], copy: StepNFA) => [...copy.states, ...acc], [...iterationStates, finalState]),
                    new Map(transitions))

                iterationStates.forEach((iterationState: StepState) => {
                    NFA.addTransition(iterationState, iterationState, transitionType.star);
                })

                for (let i = 0; i < copies.length-1; i++) {
                    const copy: StepNFA = copies[i]
                    for (const copyFinalState of copy.finalStates) {
                        NFA.addTransition(copyFinalState, iterationStates[i], transitionType.epsilon);
                        NFA.addTransition(iterationStates[i], copies[i+1].startState, transitionType.epsilon);
                    }
                }
                for (const lastCopyFinalState of copies[copies.length-1].finalStates) {
                    NFA.addTransition(lastCopyFinalState, finalState, transitionType.epsilon)
                }
                return NFA;
            })
        }
    }

    public copy(): Promise<StepNFA> {
        return new Promise((resolve) => {
            const stateMap = new Map();
            for (const state of this.states) {
                stateMap.set(state, new StepState());
            }
            const startState = stateMap.get(this.startState);
            const finalStateList = this.finalStates.map((final) => stateMap.get(final));
            const states = Array.from(stateMap.values());
            const transitionMap = new Map();

            const copyNFA = new StepNFA(startState, finalStateList, states, transitionMap);

            for (const [src, transition] of this.transitions) {
                for (const [action, destinations] of transition) {
                    for (const destination of destinations) {
                        copyNFA.addTransition(stateMap.get(src), stateMap.get(destination), action);
                    }
                }
            }
            resolve(copyNFA);
        });
    }

    public toDot(title: string): string {
        let dot =  `
        digraph ${title} {`;

        dot += `${this.startState.toString()} [style = filled, fillcolor = blue];`;
        this.finalStates.forEach((state) => {
            dot += `${state.id} [style = filled, fillcolor = red];`;
        });
        for (const [src, transition] of this.transitions) {
            for (const [action, destinations] of transition) {
                for (const dest of destinations) {
                    dot += `${src.toString()} -> ${dest.toString()} [label="${action.toString()}"];\n`;
                }
            }
        }

        dot += `}`;
        return dot;
    }

    public removeIsolated(): void {
        const statesIn = new Map();
        for (const [state, transition] of this.transitions) {
            if (transition.size > 0) {
                statesIn.set(state, true);
                for (const [action, dests] of transition) {
                    for (const dest of dests) {
                        statesIn.set(dest, true);
                    }
                }
            }
        }
        const newStateList: StepState[] = [];
        this.states.forEach((state) => {
            if (statesIn.get(state)) {
                newStateList.push(state);
            }
        });
        this.states = newStateList;
        this.finalStates = this.finalStates.filter((final) => statesIn.get(final));
    }

    public toDFA(): Promise<StepNFA> {
        return new Promise((resolve) => {
            const stateLabelMap = new Map<StepState, string>();
            const labelStateMap = new Map<string, StepState>();

            this.states.forEach((state) => {
                stateLabelMap.set(state, state.id.toString());
                labelStateMap.set(state.id.toString(), state);
            });

            const epsilonReachables = this.getEpsilonReachabilityMap();
            let reachables = epsilonReachables.get(this.startState);
            let complexStates: string[][] = [];
            if (reachables) {
                complexStates = [
                reachables.map((state) => {
                    const label = stateLabelMap.get(state);
                    if (label) {
                        return label;
                    } else {
                        throw new Error("State is not labeled");
                    }
                })];
            } else {
                reachables = [];    
            }

            // powerset
            let i = 0;
            const labeledTransitions = new Map<string[], Map<string, string[][]>>();

            while (i < complexStates.length) {
                const complexState: string[] = complexStates[i];
                const transitions = new Map<string, string[][]>();
                labeledTransitions.set(complexState, transitions);

                // Build actions available from epsilon transitions
                let actionsEpsilon: string[] = [];
                for (const state of complexState) {
                    const labelState = labelStateMap.get(state);
                    if (labelState && this.transitions.has(labelState)) {
                        const actionKeys = this.transitions.get(labelState);
                        if (actionKeys) {
                            const actions = Array.from(actionKeys.keys());
                            actionsEpsilon = actionsEpsilon.concat(actions);
                        }
                    }
                }
                actionsEpsilon = actionsEpsilon.filter((action) => action !== transitionType.epsilon);
                actionsEpsilon = [...new Set(actionsEpsilon)];

                // Create a transition of each action epsilon available destination
                for (const action of actionsEpsilon) {
                    let reachableFromAction: StepState[] = [];

                    for (const stateLabel of complexState) {
                        const state: StepState| undefined= labelStateMap.get(stateLabel);
                        if (state) {
                            const transition = this.transitions.get(state);
                            if (transition) {
                                const destinationsByActions = this.transitions.get(state)
                                if (destinationsByActions) {
                                    const destinations = destinationsByActions.get(action);
                                    let epsilonReachablesDestinations: StepState[] = [];
                                    if (destinations) {
                                        for (const destination of destinations) {
                                            const dest = epsilonReachables.get(destination);
                                            if (dest) {
                                                epsilonReachablesDestinations = epsilonReachablesDestinations.concat(dest);
                                            }
                                        }
                                        reachableFromAction = reachableFromAction.concat(epsilonReachablesDestinations);
                                    }
                                }
                            }
                        }
                    }
                    const complexDestination: StepState[] = Array.from(new Set([...reachableFromAction]));

                    function isNotEmpty(value: string | null | undefined): value is string {
                        return value !== null && value !== undefined;
                    }
                    let destinationLabel: string[] = complexDestination.map((s) => stateLabelMap.get(s)).filter(isNotEmpty);
                    
                    transitions.set(action, [destinationLabel]);

                    if (!complexStates.some((it) => it.toString() === destinationLabel.toString())) {
                        complexStates.push(destinationLabel);
                    }
                }
                ++i;
            }
            const dfaStateLabelMap: Map<string, StepState> = new Map();
            const dfaTransitions: Map<StepState, Map<string, StepState[]>> = new Map();
            const finalStatesDFA: StepState[] = [];

            for (const [newStateLabels, destinationMap] of labeledTransitions) {

                const dfaDestinationMap = new Map<string, StepState[]>();
                const newStateLabel = newStateLabels.toString();

                if (!dfaStateLabelMap.has(newStateLabel)) {
                    dfaStateLabelMap.set(newStateLabel, new StepState());
                }
                const srcState = dfaStateLabelMap.get(newStateLabel);
                if (srcState && newStateLabels.some((label) => this.finalStates.some((final) => stateLabelMap.get(final) === label))) {
                    finalStatesDFA.push(srcState);
                }
                if (srcState) {
                    dfaTransitions.set(srcState, dfaDestinationMap);
                }


                for (const [action, destinationLabels] of destinationMap) {
                    if (!dfaStateLabelMap.get(destinationLabels.toString())) {
                        dfaStateLabelMap.set(destinationLabels.toString(), new StepState());
                    }
                    const destinationState = dfaStateLabelMap.get(destinationLabels.toString());
                    if (destinationState) {
                        dfaDestinationMap.set(action, [destinationState]);
                    }
                }
            }
            const newStartStateLabels: string[] = Array.from(labeledTransitions.keys())[0];
            const startState = dfaStateLabelMap.get(newStartStateLabels.toString());
            if (startState) {
                const DFA = new StepNFA(startState, finalStatesDFA, Array.from(dfaTransitions.keys()), dfaTransitions);
                DFA.removeIsolated();
                resolve(DFA);
            }
        });
    }

    private getEpsilonReachabilityMap(): Map < StepState, StepState[]> {
        const epsilonReachabilityMap = new Map<StepState, StepState[]>();

        this.states.forEach((state) => {
            const reachables: StepState[] = [];
            this.buildEpsilonReachableRec(state, reachables);
            epsilonReachabilityMap.set(state, reachables);
        });
        return epsilonReachabilityMap;
    }

    private buildEpsilonReachableRec(currState: StepState, reachables: StepState[]): StepState[] | undefined{
        if (reachables.some((visitedstate) => currState === visitedstate)) {
            return;
        } else {
            reachables.push(currState);
            if (this.transitions.has(currState)) {
                const transitionsFromState = this.transitions.get(currState);
                if (transitionsFromState && transitionsFromState.has(transitionType.epsilon)) {
                    const eŝilonTransitions = transitionsFromState.get(transitionType.epsilon);
                    if (eŝilonTransitions) {
                        eŝilonTransitions.forEach((dest) => {
                            this.buildEpsilonReachableRec(dest, reachables);
                        });
                    }
                }

            }
        }
        return reachables;
    }

}
