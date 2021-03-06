
export type OverlayType = "rainbow" | "bluesky" | "shadow";
export default class Session {
    readonly id : string;
    readonly webSiteId : string;
    readonly baseURL: string | undefined;
    readonly overlayType: OverlayType;
    readonly useTestScenario: boolean;

    constructor(id: string, webSiteId: string, overlayType: OverlayType, useTestScenario: boolean, baseURL?:string) {
        if (id === null || id === undefined) {
            throw new Error('cannot create Session without id');
        }
        this.overlayType = overlayType;
        this.id = id;
        this.useTestScenario = useTestScenario

        if (webSiteId === null || webSiteId === undefined) {
            throw new Error('cannot create Session without webSiteId');
        }
        this.webSiteId = webSiteId;
        this.baseURL = baseURL;
    }

}