export default class AifexPluginInfo {
    readonly version: string;
    readonly name: string;
    readonly description: string;
    readonly url: string;

    constructor(version: string, name: string, description: string, url: string) {
        this.version = version;
        this.name = name;
        this.description = description;
        this.url = url;
    }
}