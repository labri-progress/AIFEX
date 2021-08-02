import Exploration from "./Exploration";
import WebSite from "./WebSite";



export type SessionOverlayType = "shadow" | "bluesky" | "rainbow";


export default class Session {
    readonly id: string;
    readonly name: string;
    readonly baseURL: string;
    readonly webSite: WebSite;
    readonly createdAt: Date | undefined;
    readonly updatedAt: Date | undefined;
    readonly overlayType: SessionOverlayType;
    readonly useTestScenario: boolean;
    readonly explorationList: Exploration[];

    constructor(id: string,
        name: string,
        baseURL: string,
        webSite: WebSite,
        createdAt: Date,
        updatedAt: Date,
        useTestScenario: boolean,
        overlayType: SessionOverlayType,
        explorationList: Exploration[] )
    {
        this.id = id;
        this.webSite = webSite;
        this.baseURL = baseURL;
        this.explorationList = [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.name = name;
        this.overlayType = overlayType;
        this.useTestScenario = useTestScenario;
        this.explorationList = explorationList;
    }

    
}
