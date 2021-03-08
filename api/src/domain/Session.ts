
export type SessionOverlayType = "shadow" | "bluesky" | "rainbow";


export default class Session {
    private _id: string;
    private _webSiteId: string;
    private _baseURL: string;
    private _name: string;
    private _createdAt: Date | undefined;
    private _updatedAt: Date | undefined;
    private _overlayType: SessionOverlayType;
    private _useTestScenario: boolean;

    constructor(
        id: string,
        baseURL: string,
        webSiteId: string,
        name: string,
        useTestScenario: boolean,
        overlayType: SessionOverlayType = "rainbow",
        createdAt?: Date,
        updatedAt?: Date,)
    {
        this._webSiteId = webSiteId;
        this._baseURL = baseURL;
        this._name = name;
        this._overlayType = overlayType;
        this._useTestScenario = useTestScenario;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id(): string {
        return this._id;
    }

    get webSiteId(): string {
        return this._webSiteId;
    }

    get baseURL(): string {
        return this._baseURL;
    }

    get name(): string {
        return this._name;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
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
