import StepAST from "./StepAST";

export default interface IStepParser {
    parseStepExpression(text: string): Promise<StepAST>;
}
