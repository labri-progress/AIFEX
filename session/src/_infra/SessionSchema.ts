import {model, Schema, Document} from "mongoose";

const SESSION_SCHEMA: Schema = new Schema({
    _id: {type: String, required: true},
    webSiteId: {type: String, required: true},
    baseURL: String,
    name: String,
    description: String,
    overlayType: { type: 'String', enum: ["shadow", "bluesky", "rainbow"], default: 'rainbow' },
    createdAt: {type: Date, default: Date.now},
    recordingMode: { type: 'String', enum: ["byexploration", "byinteraction"], default: 'byexploration' },
},
{
    timestamps: true,
});

export interface SessionDocument extends Document {
    _id: string;
    webSiteId: string;
    name: string;
    overlayType: string;
    baseURL: string;
    createdAt: Date;
    description: string,
    recordingMode: string,
}

export default model<SessionDocument>("Session", SESSION_SCHEMA);
