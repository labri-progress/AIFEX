import AST from "../_infra/AST";

export default interface IStepParser {
    parseStepExpression(text: string): Promise<AST>;
}
