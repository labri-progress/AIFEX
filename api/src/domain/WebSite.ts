import Mapping from "./Mapping";

export default class WebSite {
    readonly id: string;
    readonly name: string;
    readonly mappingList: Mapping[];

    constructor(id : string, name: string, mappingList : Mapping[]) {
        this.id = id;
        this.name = name;

        this.mappingList = mappingList;
    }

}
