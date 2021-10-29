export default class WebSite {
    public readonly name: string;
    public readonly id: string;

    constructor(id: string, name: string) {
        if (id === undefined) {
            throw new Error("Cannot build WebSite, with undefined as id");
        }
        this.id = id;

        if (name === undefined) {
            throw new Error("Cannot build WebSite, with undefined as name");
        }
        this.name = name;
    }

}
