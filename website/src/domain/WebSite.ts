import Mapping from "./Mapping";
import IdGeneratorService from "./IdGeneratorService";

export default class WebSite {
    private _id: string;
    private _name: string;
    private _mappingList: Mapping[];

    constructor(idGeneratorService : IdGeneratorService, name: string, id?: string) {
        this._name = name;

        if (id !== undefined && id !== null) {
            this._id = id;
        } else {
            this._id = idGeneratorService.generateId();
        }

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
