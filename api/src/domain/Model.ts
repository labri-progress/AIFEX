import { ModelPredictionType } from "./ModelPredictionType";

export default class Model {
    public readonly id : string;
    public readonly depth : number;
    public readonly interpolationfactor : number;
    public readonly predictionType : ModelPredictionType;
    public readonly sessionIdList: string[];

    constructor(id: string, depth : number, interpolationfactor: number, predictionType: ModelPredictionType, sessionIdList: string[]) {
        this.id = id;
        this.depth = depth;
        this.interpolationfactor = interpolationfactor;
        this.predictionType = predictionType;
        this.sessionIdList = sessionIdList;
    }
}