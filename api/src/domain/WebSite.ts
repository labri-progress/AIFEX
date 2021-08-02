import Mapping from "./Mapping";

export default class WebSite {
    readonly id: string;
    readonly name: string;
    readonly url: string;
    readonly mappingList: Mapping[];

    constructor(id : string, name: string, url: string, mappingList : Mapping[]) {
        this.id = id;
        this.name = name;
        this.url = url;

        this.mappingList = mappingList;
    }

}
