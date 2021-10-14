import Action from "./Action";
import Comment from "./Comment";
import Model from "./Model";
import { ModelPredictionType } from "./ModelPredictionType";
import CommentDistribution from "./CommentDistribution";
import Ngram from "./Ngram";

export default interface ModelService {

    findModelById(id: string): Promise<Model | undefined>;

    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType): Promise<string>;

    linkModelToSession(modelId: string, sessionId: string): Promise<"ModelLinkedToSession" | "ModelIsUnknown">;

    computeProbabilities(modelId: string, interactionList: (Action | Comment)[]): Promise<Map<string,number>>;

    getCommentDistributions(modelId: string, interactionList: (Action | Comment)[]): Promise<Map<string,CommentDistribution[]>>;

    getAllNgram(modelId: string): Promise<Ngram[]>;

}