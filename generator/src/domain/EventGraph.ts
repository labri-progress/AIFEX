import { logger } from "../logger";
import Action from "./Action";

export default class EventGraph {
    private _adjMatrix: boolean[][];
    private _indexes: Map<string, number>;
    private _actions: Map<number, Action>;

    constructor() {
        this._adjMatrix = [];
        this._indexes = new Map();
        this._actions = new Map();
        this.addExploration([new Action('start')]);
    }

    private actionToKey(action: Action): string {
        if (action.value) {
            return action.kind + "$" + action.value.split('?')[0];
        } else {
            return action.kind;
        }
    }

    get adjMatrix(): boolean[][] {
        return this._adjMatrix.slice();
    }

    get indexes(): Map<string, number> {
        return new Map(this._indexes);
    }

    get actions(): Map<number, Action> {
        return new Map(this._actions);
    }

    addExploration(actions: Action[]): void {
        let lastActionIndex : number | undefined = undefined
        actions.forEach((action) => {
            let actionIndex = this._indexes.get(this.actionToKey(action));
            if (actionIndex === undefined) {
                actionIndex = this._adjMatrix.length;
                this._indexes.set(this.actionToKey(action), actionIndex);
                this._actions.set(actionIndex, action);
                this._adjMatrix.push([]);
            }
            this._adjMatrix[actionIndex][actionIndex] = true;
            if (lastActionIndex !== undefined) {
                this._adjMatrix[lastActionIndex][actionIndex] = true;
            }
            lastActionIndex = actionIndex;
        });
    }

    dijkstra(start: Action, end: Action): Action[] {
        const startKey = this.actionToKey(start);
        const endKey = this.actionToKey(end);
        const startIdx = this._indexes.get(startKey);
        const endIdx = this._indexes.get(endKey);
        if (startIdx === undefined || endIdx === undefined) {
            return [];
        }
        const dist : Array<number>  = this._adjMatrix.map(() => Infinity);
        const prev : Array<number | undefined> = this._adjMatrix.map(() => undefined);
        dist[startIdx] = 0;
        const unvisited = this._adjMatrix.map((_, idx) => idx);
        while (unvisited.length > 0) {
            let minIdx = 0;
            for (let i = 1; i < unvisited.length; i++) {
                if (dist[unvisited[i]] < dist[unvisited[minIdx]]) {
                    minIdx = i;
                }
            }
            const u = unvisited[minIdx];
            unvisited.splice(minIdx, 1);
            for (let v = 0; v < this._adjMatrix.length; v++) {
                if (this._adjMatrix[u][v] && dist[v] > dist[u] + 1) {
                    dist[v] = dist[u] + 1;
                    prev[v] = u;
                }
            }
        }
        const path: Action[] = [];
        let current : number | undefined = endIdx;
        while (current !== undefined) {
            let action = this._actions.get(current)
            if (action !== undefined) {
                path.push(action);
            }
            current = prev[current];
        }
        return path.reverse();
    }

    shortPathToTarget(target: Action) : Action[] {
        return this.dijkstra(new Action('start'), target); 
    }



}