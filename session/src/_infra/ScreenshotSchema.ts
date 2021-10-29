import {model, Schema, Document} from "mongoose";



const SCREENSHOT_SCHEMA: Schema = new Schema({
    sessionId: {type: String, required: true},
    explorationNumber: {type: Number, required: true},
    interactionIndex: {type: Number, required: true},
},
{
    timestamps: true,
});

export interface ScreenShotDocument extends Document {
    sessionId: string;
    explorationNumber: number;
    interactionIndex: number;
}

export default model<ScreenShotDocument>("Screenshot", SCREENSHOT_SCHEMA);
