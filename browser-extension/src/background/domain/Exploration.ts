import Comment from "./Comment";
import Action from "./Action";
import Answer from "./Answer";

export default class Exploration {

    private _startDate : Date;
    private _stopDate : Date | undefined;
    private _actions: (Action | Comment | Answer)[];

    constructor() {
        this._actions = [];
        this._startDate = new Date();
    }

    get startDate(): Date {
        return this._startDate;
    }

    get stopDate(): Date | undefined {
        return this._stopDate;
    }

    get actions(): Action[] {
        return this._actions.filter(interaction => interaction instanceof Action) as Action[];
    }

    get evaluableInteractions(): (Action | Answer)[] {
        return this._actions.filter(interaction => interaction instanceof Action || interaction instanceof Answer) as (Action | Answer)[];

    }

    get length(): number {
        return this._actions.length;
    }

    isEmpty(): boolean {
        return this._actions.length <= 1;
    }

    addAction(kind: string, value?: string): void {
        this._actions.push(new Action(kind, value, this._actions.length));
    }

    addAnswer(text: string, value: string): void {
        this._actions.push(new Answer(text, value, this._actions.length))
    }

    addComment(comment: Comment): void{
        comment.index = this._actions.length;
        this._actions.push(comment);
    }

    stop(): void {
        this._stopDate = new Date();
    }

    interactionsToJSON(): {
                            concreteType: string;
                            kind: string;
                            value: string | undefined;
                            date: Date;
                        }[] {
        return this._actions.map(interaction => {

            return (
                {
                    concreteType: interaction.getConcreteType(),
                    kind: interaction.kind,
                    value: interaction.value,
                    date: interaction.date
                }
            )
        })
    }

}