export default  class Tester {
    public name: string;
    constructor(name: string) {
        if (name === undefined || name === null) {
            throw new Error("Cannot create tester with no name");
        }
        this.name = name;
    }
}
