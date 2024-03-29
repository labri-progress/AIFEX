import { generate } from "shortid";
import Observation from "./Observation";
import Exploration from "./Exploration";
import { RecordingMode } from "./RecordingMode";
import Interaction from "./Interaction";
import { SessionOverlayType } from "./SessionOverlyaType";
import Tester from "./Tester";
import WebSite from "./WebSite";

export default class Session {

    private _id: string;
    private _webSite: WebSite;
    private _baseURL: string;
    private _name: string;
    private _description: string;
    private _explorationList: Exploration[];
    private _createdAt: Date;
    private _overlayType: SessionOverlayType;
    private _explorationRecordingMode: RecordingMode;

    constructor(id: string = generate(),
        webSite: WebSite,
        baseURL: string,
        name: string,
        description: string,
        createdAt: Date = new Date(),
        overlayType: SessionOverlayType = "rainbow",
        explorationRecordingMode: RecordingMode = "byexploration") 
    {
        this._id = id;
        this._webSite = webSite;
        this._baseURL = baseURL;
        this._name = name;
        this._description = description;
        this._explorationList = [];
        this._createdAt = createdAt;
        this._overlayType = overlayType;
        this._explorationRecordingMode = explorationRecordingMode;
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

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
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

    get overlayType(): SessionOverlayType {
        return this._overlayType;
    }

    get recordingMode(): RecordingMode {
        return this._explorationRecordingMode;
    }

    public static getOverlayTypes(): SessionOverlayType[] {
        return ["shadow", "bluesky", "rainbow"]
    }

    public static getRecordingModes(): RecordingMode[] {
        return ["byexploration", "byinteraction"]
    }

    public changeBaseURL(baseURL: string): void {
        this._baseURL = baseURL;
    }

    public changeName(name : string) {
        this._name = name;
    }

    public changeDescription(description : string) {
        this._description = description;
    }

    public changeOverlayType(overlayType: SessionOverlayType) {
        this._overlayType = overlayType;
    }

    public changeRecordingMode(recordingMode: RecordingMode) {
        this._explorationRecordingMode = recordingMode;
    }

    public changeWebSite(webSite: WebSite) {
        this._webSite = webSite;
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

    public removeExploration(explorationNumber: number): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot stop exploration, wrong explorationNumber.");
        }
        this._explorationList[explorationNumber].remove();

    }

    public addObservationToExploration(explorationNumber: number, observation: Observation): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add observation to exploration, wrong explorationNumber.");
        }
        if (this.explorationList[explorationNumber].isRemoved) {
            throw new Error("cannot add observation to exploration, exploration is removed.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addObservation(observation);
    }

    public addInteractionListToExploration(explorationNumber: number, interactionList: Interaction[]): void {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add interaction to exploration, wrong explorationNumber.");
        }
        if (this.explorationList[explorationNumber].isRemoved) {
            throw new Error("cannot add interaction to exploration, exploration is removed.");
        }
        const exploration = this._explorationList[explorationNumber];
        exploration.addInteractionList(interactionList);
    }

    public getInteractionListOfExploration(explorationNumber: number): Interaction[] {
        if (explorationNumber < 0 || explorationNumber >= this._explorationList.length) {
            throw new Error("cannot add return InteractionList to exploration, wrong explorationNumber.");
        }
        if (this.explorationList[explorationNumber].isRemoved) {
            throw new Error("cannot return InteractionList to exploration, exploration is removed.");
        }
        return this._explorationList[explorationNumber].interactionList;
    }

}
