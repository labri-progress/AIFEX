import Mapping from "./Mapping";

export default class WebSite {
    private _id: string;
    private _name: string;
    private _url: string;
    private _mappingList: Mapping[];

    constructor(id : string, name: string, url: string, mappingList : Mapping[]) {
        this._id = id;
        this._name = name;
        this._url = url;

        this._mappingList = mappingList;
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

    public addMapping(mapping: Mapping): void {
        this._mappingList.push(mapping);
    }

    public addMappingList(mappingList: Mapping[]): void {
        mappingList.forEach((mapping) => this.addMapping(mapping));
    }
}
