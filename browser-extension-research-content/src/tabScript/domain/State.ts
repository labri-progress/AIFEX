import WebSite from "../../background/domain/Website";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isActive: boolean;

    constructor(isActive: boolean) {
        this.isActive = isActive;
    }
}