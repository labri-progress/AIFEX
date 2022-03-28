export default class CompatibilityCheck {
    readonly extensionVersion: string;
	readonly serverVersion: string;
    readonly url: string;

    constructor(extensionVersion : string, serverVersion: string, url : string) {
        this.extensionVersion = extensionVersion;
        this.serverVersion = serverVersion;
        this.url = url;
    }
}