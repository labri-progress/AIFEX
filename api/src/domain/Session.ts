import Exploration from "./Exploration";
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
        id: string,
        name: string,
        useTestScenario: boolean,
        createdAt?: Date,
        updatedAt?: Date,
        overlayType: SessionOverlayType = "rainbow")
    {
        this._id = id;
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

}
