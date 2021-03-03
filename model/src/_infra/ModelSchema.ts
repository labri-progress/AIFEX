import { Schema, model, Document } from "mongoose";

const MODEL_SCHEMA = new Schema({
    _id: {type: String, required: true},
    depth : Number,
    interpolationfactor : Number,
    sessionIdList: [{type: String}],
    crossEntropyBySession: {type: Array},
},
{
    timestamps: true,
});

export interface ModelDocument extends Document {
    _id: string;
    depth: number;
    interpolationfactor: number;
    sessionIdList?: string[];
    crossEntropyBySession?: {
        sessionId: string,
        crossEntropyList: number[]
    }[]
}

export default model<ModelDocument>("Model", MODEL_SCHEMA);
