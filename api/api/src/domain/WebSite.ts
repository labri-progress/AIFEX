import Mapping from "./Mapping";

// Aggregate (name is key id)
export default class WebSite {
    private id: string;
    private name: string;
    private url: string;
    private mappingList: Mapping[];

    constructor(id : string, name: string, url: string, mappingList: Mapping[]= []) {
        if ((id === undefined) || (id === null)) {
            throw new Error("id must not be undefined or null");
        }
        if ((name === undefined) || (name === null)) {
            throw new Error("name must not be undefined or null");
        }
        this.name = name;

        this.url = url;

        this.id = id;
        
        this.mappingList = mappingList;
    }


  
}
