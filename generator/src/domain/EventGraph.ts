import Action from "./Action";

export default class EventGraph {
    private _adjMatrix: boolean[][];
    private _indexes: Map<string, number>;
    private _actions: Map<number, Action>;
    private _root : Action;

    constructor() {
        this._adjMatrix = [];
        this._indexes = new Map();
        this._actions = new Map();
        this._root = new Action('__root__');
        this.addExploration([this._root]);
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
        let lastActionIndex : number | undefined = this._indexes.get(this._root.key);
        actions.forEach((action) => {
            let actionIndex = this._indexes.get(action.key);
            if (actionIndex === undefined) {
                actionIndex = this._adjMatrix.length;
                this._indexes.set(action.key, actionIndex);
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
        const startIdx = this._indexes.get(start.key);
        const endIdx = this._indexes.get(end.key);
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
        let pathFromRoot = this.dijkstra(this._root, target);
        pathFromRoot.shift();
        return  pathFromRoot;
    }

}