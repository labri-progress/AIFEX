import Action from "./Action";
import ActionInteraction from "./ActionInteraction";
import Observation from "./Observation";
import ObersationInteraction from "./ObservationInteraction";
import Interaction from "./Interaction";
import Tester from "./Tester";

export default class Exploration {
    private _tester: Tester;
    private _isStopped: boolean;
    private _explorationNumber: number;
    private _interactionList: Interaction[];
    private _startDate : Date;
    private _stopDate : Date | undefined;

    constructor(tester: Tester, explorationNumber: number, startDate?:Date) {
        this._tester = tester;
        if (startDate) {
            this._startDate = startDate;
        } else {
            this._startDate = new Date();
        }

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create exploration, explorationNumber is null or undefined");
        }
        this._explorationNumber = explorationNumber;
        this._isStopped = false;
        this._interactionList = [];
    }

    public stop(stopDate?:Date): void {
        this._isStopped = true;
        if (stopDate) {
            this._stopDate = stopDate;
        } else {
            this._stopDate = new Date();
        }
        
    }

    get isStopped(): boolean {
        return this._isStopped;
    }

    get tester(): Tester {
        return this._tester;
    }

    get explorationNumber(): number {
        return this._explorationNumber;
    }

    get startDate() : Date {
        return this._startDate;
    }

    get stopDate() : Date | undefined {
        return this._stopDate;
    }

    public addAction(action: Action): void {
        if (this.isStopped) {
            throw new Error("cannot add action to exploration, exploration is stopped");
        }
        this._interactionList.push(new ActionInteraction(this._interactionList.length, action));
    }

    public addObservation(observation: Observation): void {
        if (this.isStopped) {
            throw new Error("cannot add observation to exploration, exploration is stopped");
        }
        this._interactionList.push(new ObersationInteraction(this._interactionList.length, observation));
    }

    public addInteractionList(interactionList: Interaction[]): void {
        if (this.isStopped) {
            throw new Error("cannot add interaction to exploration, exploration is stopped");
        }
        this._interactionList.push(...interactionList);
    }

    get interactionList(): Interaction[] {
        return this._interactionList.slice();
    }

}
