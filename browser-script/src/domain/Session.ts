
export type OverlayType = "rainbow" | "bluesky" | "shadow";
export type RecordingMode = "byexploration" | "byinteraction";
export default class Session {
    readonly id : string;
    readonly webSiteId : string;
    readonly baseURL: string | undefined;
    readonly name : string;
    readonly description : string | undefined;
    readonly overlayType: OverlayType;
    readonly recordingMode: RecordingMode;

    constructor(id: string, webSiteId: string, baseURL:string | undefined, name : string, description : string, overlayType: OverlayType, recordingMode: RecordingMode) {
        if (id === null || id === undefined) {
            throw new Error('cannot create Session without id');
        }
        if (webSiteId === null || webSiteId === undefined) {
            throw new Error('cannot create Session without webSiteId');
        }
        this.id = id;
        this.webSiteId = webSiteId;
        this.baseURL = baseURL;
        this.name = name;
        this.description = description;
        this.overlayType = overlayType;        
        this.recordingMode = recordingMode;
    }

}