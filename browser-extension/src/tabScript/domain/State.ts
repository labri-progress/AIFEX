export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isRecording: boolean;
    showProbabilityPopup: boolean;
    overlayType: OverlayType;


    constructor(isActive: boolean, overlayType: OverlayType, showProbabilityPopup: boolean) {
        this.isRecording = isActive;
        this.overlayType = overlayType;
        this.showProbabilityPopup = showProbabilityPopup;
    }
}