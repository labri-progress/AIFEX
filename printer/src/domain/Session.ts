import Observation from "../domain/Observation";
import Action from "./Action";
import Exploration from "./Exploration";
import Interaction from "./Interaction";
import WebSite from "./WebSite";

export default class Session {
    private _id: string;
    private _webSite: WebSite | undefined;
    private _baseURL: string;
    private _explorationList: Exploration[];

    constructor(id: string, baseURL: string) {
        if (id === undefined || id === null) {
            throw new Error("Cannot create Session with undefined or null id");
        }
        this._id = id;
        this._baseURL = baseURL;
        this._explorationList = [];
    }

    get id(): string {
        return this._id;
    }

    get webSite(): WebSite | undefined {
        return this._webSite;
    }

    set webSite(webSite: WebSite | undefined) {
        this._webSite = webSite;
    }

    get baseURL(): string {
        return this._baseURL;
    }

    get numberOfExploration(): number {
        return this._explorationList.length;
    }

    get explorationList(): Exploration[] {
        return this._explorationList.slice();
    }

    public startExploration(): number {
        const explorationNumber = this._explorationList.length;
        const exploration: Exploration = new Exploration(explorationNumber);
        this._explorationList.push(exploration);
        return explorationNumber;
    }

    public addActionToExploration(explorationNumber: number, action: Action): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add action to exploration, wrong explorationNumber.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addAction(action);
    }

    public addObservationToExploration(explorationNumber: number, observation: Observation): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add observation to exploration, wrong explorationNumber.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addObservation(observation);
    }

    public addInteractionListToExploration(explorationNumber: number, interactionList: Interaction[]): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add observation to exploration, wrong explorationNumber.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addInteractionList(interactionList);
    }

    public getInteractionListOfExploration(explorationNumber: number): Interaction[] {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add return InteractionList to exploration, wrong explorationNumber.");
        }
        return this._explorationList[explorationNumber].interactionList;
    }

}
