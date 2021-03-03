import {model, Schema, Document} from "mongoose";

const VIDEO_SCHEMA: Schema = new Schema({
    sessionId: {type: String, required: true},
    explorationNumber: {type: Number, required: true},
},
{
    timestamps: true,
});

export interface VideoDocument extends Document {
    sessionId: string;
    explorationNumber: number;
    createdAt?: Date;
    updatedAt?: Date;
}



export default model<VideoDocument>("VIDEO", VIDEO_SCHEMA);
