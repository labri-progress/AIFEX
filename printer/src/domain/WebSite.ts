import Mapping from "./Mapping";

export default class WebSite {
    private _id: string;
    private _name: string;
    private _mappingList: Mapping[];

    constructor(id: string, name: string ) {
        if (id === undefined && id === null) {
            throw new Error("WebSite id must not be undefined or null");
        }
        this._id = id;

        if ((name === undefined) || (name === null)) {
            throw new Error("name must not be undefined or null");
        }
        this._name = name;

        this._mappingList = [];
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get mappingList(): Mapping[] {
        return this._mappingList;
    }

    public addMapping(mapping: Mapping): void {
        this._mappingList.push(mapping);
    }

    public addMappingList(mappingList: Mapping[]): void {
        mappingList.forEach((mapping) => this.addMapping(mapping));
    }
}
