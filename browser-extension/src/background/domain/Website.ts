export default class WebSite {
    public id: string;
    public name: string;
    public mappingList: {match: any, output: any, description: string}[];

    constructor(id: string, name: string, mappingList: {match: any, output: any, description: string}[]) {
        this.id = id;
        this.name = name;
        this.mappingList = mappingList;
    }
}