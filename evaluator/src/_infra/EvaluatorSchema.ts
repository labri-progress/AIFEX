import {model, Schema, Document} from "mongoose";

const SEQUENCE_EVALUATOR_SCHEMA: Schema = new Schema({
    sessionId: {type: String, required: true},
    description: {type: String},
    expression: {type: String},
},
{
    timestamps: true,
});

export interface EvaluatorDocument extends Document {
    _id: string,
    sessionId: string,
    description: string,
    expression: string
  }

export const sequenceEvaluatorModel = model<EvaluatorDocument>("Objective", SEQUENCE_EVALUATOR_SCHEMA);
