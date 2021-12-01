import {model, Schema, Document} from "mongoose";

const TESTER_SCHEMA: Schema = new Schema({
    name: {type: String, required: true},
},
{
    timestamps: true,
});

export interface TesterDocument extends Document {
    _id: string;
    name: string;
}

export default model<TesterDocument>("Tester", TESTER_SCHEMA);

