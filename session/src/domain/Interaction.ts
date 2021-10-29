export default class Interaction {
    public readonly index: number;
    public readonly date: Date;

    constructor(index: number, date?: Date) {
        this.index = index;
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }
    
}
