import { generate } from "shortid";
import Comment from "../domain/Comment";
import Action from "./Action";
import Exploration from "./Exploration";
import Interaction from "./Interaction";
import Tester from "./Tester";
import WebSite from "./WebSite";



export type SessionOverlayType = "shadow" | "bluesky" | "rainbow";


export default class Session {
    private _id: string;
    private _webSite: WebSite;
    private _baseURL: string;
    private _name: string;
    private _explorationList: Exploration[];
    private _createdAt: Date | undefined;
    private _updatedAt: Date | undefined;
    private _overlayType: SessionOverlayType;
    private _useTestScenario: boolean;

    constructor(webSite: WebSite,
        baseURL: string,
        id: string = generate(),
        name: string,
        useTestScenario: boolean,
        createdAt?: Date,
        updatedAt?: Date,
        overlayType: SessionOverlayType = "rainbow")
    {
        this._id = id;

        if (!(webSite instanceof WebSite)) {
            throw new Error("Cannot create Session with webSite not a WebSite instance");
        }
        this._webSite = webSite;
        this._baseURL = baseURL;
        this._explorationList = [];
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._name = name;
        this._overlayType = overlayType;
        this._useTestScenario = useTestScenario;
    }

    get id(): string {
        return this._id;
    }

    get webSite(): WebSite {
        return this._webSite;
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

    get createdAt(): Date | undefined {
        return this._createdAt;
    }

    get updatedAt(): Date | undefined {
        return this._updatedAt;
    }

    get name(): string {
        return this._name;
    }

    get overlayType(): SessionOverlayType {
        return this._overlayType;
    }

    get useTestScenario(): boolean {
        return this._useTestScenario;
    }

    public static getOverlayTypes(): SessionOverlayType[] {
        return ["shadow", "bluesky", "rainbow"]
    }

    public startExploration(tester: Tester, startDate?:Date): number {
        const explorationNumber = this._explorationList.length;
        const exploration: Exploration = new Exploration(tester, explorationNumber, startDate);
        this._explorationList.push(exploration);
        return explorationNumber;
    }

    public stopExploration(explorationNumber: number, stopDate?:Date): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot stop exploration, wrong explorationNumber.");
        }
        this._explorationList[explorationNumber].stop(stopDate);
    }

    public addActionToExploration(explorationNumber: number, action: Action): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add action to exploration, wrong explorationNumber.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addAction(action);
    }

    public addCommentToExploration(explorationNumber: number, comment: Comment): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add comment to exploration, wrong explorationNumber.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addComment(comment);
    }

    public addInteractionListToExploration(explorationNumber: number, interactionList: Interaction[]): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add comment to exploration, wrong explorationNumber.");
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
