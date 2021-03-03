export default class CompatibilityCheck {
    readonly currentVersion: string;
	readonly latestVersion: string;
    readonly url: string;

    constructor(currentVersion : string, latestVersion: string, url : string) {
        this.currentVersion = currentVersion;
        this.latestVersion = latestVersion;
        this.url = url;
    }
}