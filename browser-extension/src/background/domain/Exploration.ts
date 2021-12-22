import Comment from "./Comment";
import Action from "./Action";

export default class Exploration {

    private _startDate : Date;
    private _stopDate : Date | undefined;
    private _actions: (Action | Comment )[];
    private _explorationNumber: number;
    private _hasBeenUpdated: boolean;

    constructor(_explorationNumber: number) {
        this._actions = [];
        this._startDate = new Date();
        this._explorationNumber = _explorationNumber
        this._hasBeenUpdated = false;
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

    get evaluableInteractions(): (Action)[] {
        return this._actions.filter(interaction => interaction instanceof Action) as (Action)[];

    }

    get length(): number {
        return this._actions.length;
    }

    get hasBeenUpdated(): boolean {
        return this._hasBeenUpdated;
    }

    get explorationNumber(): number {
        return this._explorationNumber;
    }

    isEmpty(): boolean {
        return this._actions.length <= 1;
    }

    addAction(kind: string, value?: string): void {
        this._actions.push(new Action(kind, value, this._actions.length));
        this._hasBeenUpdated = true;
    }

    removeLastAction() {
        if (this.actions.length > 1) {
            this.actions.pop()
        }
    }

    addComment(comment: Comment): void{
        comment.index = this._actions.length;
        this._actions.push(comment);
    }

    setStopDate(): void {
        this._stopDate = new Date();
    }

    interactionsToJSON(): {
                            index: number,
                            concreteType: string;
                            kind: string;
                            value: string | undefined;
                            date: Date;
                        }[] {
        return this._actions.map((interaction, index) => {

            return (
                {
                    index: index,
                    concreteType: interaction.getConcreteType(),
                    kind: interaction.kind,
                    value: interaction.value,
                    date: interaction.date
                }
            )
        })
    }

}