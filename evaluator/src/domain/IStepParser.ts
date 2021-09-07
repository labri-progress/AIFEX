import StepAST from "../_infra/StepAST";

export default interface IStepParser {
    parseStepExpression(text: string): Promise<StepAST>;
}
