import Mapping from "./Mapping";

// Aggregate (name is key id)
export default class WebSite {
    private _id: string;
    private _name: string;
    private _url: string;
    private _mappingList: Mapping[];

    constructor(id : string, name: string, url: string) {
        if ((id === undefined) || (id === null)) {
            throw new Error("id must not be undefined or null");
        }
        if ((name === undefined) || (name === null)) {
            throw new Error("name must not be undefined or null");
        }
        this._name = name;

        this._url = url;

        this._id = id;
        
        this._mappingList = [];
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get url(): string {
        return this._url;
    }

    get mappingList(): Mapping[] {
        return this._mappingList;
    }

    public addMapping(mapping: Mapping) {
        this._mappingList.push(mapping);
    }

    public addMappingList(mappingList: Mapping[]) {
        mappingList.forEach((mapping) => this.addMapping(mapping));
    }
}
