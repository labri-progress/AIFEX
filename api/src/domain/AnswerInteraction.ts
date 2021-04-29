import Answer from "./Answer";
import Interaction from "./Interaction";

export default class AnswerInteraction extends Interaction {
    public readonly answer: Answer;

    constructor(index: number, answer: Answer, date?: Date) {
        super(index, date);
        this.answer = answer;
    }
}
