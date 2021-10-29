import Step from "./Step";

export default interface StepFactory {
    createStep(expression: string): Promise<Step>;
    checkExpressionValidity(expression: string): Promise<boolean>;
}