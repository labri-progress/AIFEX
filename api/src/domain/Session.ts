import Exploration from "./Exploration";
import { SessionOverlayType } from "./SessionOverlayType";
import { RecordingMode } from "./RecordingMode";
import WebSite from "./WebSite";




export default class Session {
    readonly id: string;
    readonly webSite: WebSite;
    readonly baseURL: string;
    readonly name: string;
    readonly description: string;
    readonly createdAt: Date;
    readonly overlayType: SessionOverlayType;
    readonly recordingMode: RecordingMode;
    readonly explorationList: Exploration[];

    constructor(id: string,
        baseURL: string,
        webSite: WebSite,
        name: string,
        description: string,
        createdAt: Date,
        overlayType: SessionOverlayType,
        recordingMode: RecordingMode,
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
        this.recordingMode = recordingMode;
        this.explorationList = explorationList;
    }

    
}
