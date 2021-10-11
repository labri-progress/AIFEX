import {model, Schema, Document} from "mongoose";

const SESSION_SCHEMA: Schema = new Schema({
    _id: {type: String, required: true},
    webSiteId: {type: String, required: true},
    baseURL: String,
<<<<<<< HEAD
=======
    description: String,
>>>>>>> b676e36c72c7c9c350e3eef4ec4821dcf880a7d7
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
<<<<<<< HEAD
=======
    description: string;
>>>>>>> b676e36c72c7c9c350e3eef4ec4821dcf880a7d7
    overlayType: string;
    baseURL: string;
    createdAt: Date;
}


export default model<SessionDocument>("Session", SESSION_SCHEMA);
