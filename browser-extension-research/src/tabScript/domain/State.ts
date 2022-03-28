import WebSite from "../../background/domain/Website";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isActive: boolean;
    showProbabilityPopup: boolean;
    overlayType: OverlayType;
    webSite: WebSite


    constructor(isActive: boolean, overlayType: OverlayType, showProbabilityPopup: boolean, webSite: WebSite) {
        this.isActive = isActive;
        this.overlayType = overlayType;
        this.webSite = webSite;
        this.showProbabilityPopup = showProbabilityPopup;
    }
}