import Exploration from "./Exploration";
import WebSite from "./WebSite";



export type SessionOverlayType = "shadow" | "bluesky" | "rainbow";


export default class Session {
    readonly id: string;
    readonly webSite: WebSite;
    readonly baseURL: string;
    readonly name: string;
    readonly description: string;
    readonly createdAt: Date;
    readonly overlayType: SessionOverlayType;
    readonly explorationList: Exploration[];

    constructor(id: string,
        baseURL: string,
        webSite: WebSite,
        name: string,
        description: string,
        createdAt: Date,
        overlayType: SessionOverlayType,
        explorationList: Exploration[] )
    {
        this.id = id;
        this.webSite = webSite;
        this.baseURL = baseURL;
        this.name = name;
        this.description = description;
        this.explorationList = [];
        this.createdAt = createdAt;
        this.overlayType = overlayType;
        this.explorationList = explorationList;
    }

    
}
