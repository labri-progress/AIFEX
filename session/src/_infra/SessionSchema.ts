import {model, Schema, Document} from "mongoose";

const SESSION_SCHEMA: Schema = new Schema({
    _id: {type: String, required: true},
    webSiteId: {type: String, required: true},
    baseURL: String,
    description: String,
    name: String,
    overlayType: { type: 'String', enum: ["shadow", "bluesky", "rainbow"], default: 'rainbow' },
    createdAt: {type: Date, default: Date.now},
},
{
    timestamps: true,
});

export interface SessionDocument extends Document {
    _id: string;
    webSiteId: string;
    name: string;
    description: string;
    overlayType: string;
    baseURL: string;
    createdAt: Date;
}


export default model<SessionDocument>("Session", SESSION_SCHEMA);
