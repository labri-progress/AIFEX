import {model, Schema, Document} from "mongoose";

const SESSION_SCHEMA: Schema = new Schema({
    _id: {type: String, required: true},
    webSiteId: {type: String, required: true},
    baseURL: String,
    useTestScenario: Boolean,
    name: String,
    overlayType: { type: 'String', enum: ["shadow", "bluesky", "rainbow"], default: 'rainbow' },
},
{
    timestamps: true,
});

export interface SessionDocument extends Document {
    _id: string;
    webSiteId: string;
    name: string;
    useTestScenario: boolean;
    overlayType: string;
    baseURL: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export default model<SessionDocument>("Session", SESSION_SCHEMA);
