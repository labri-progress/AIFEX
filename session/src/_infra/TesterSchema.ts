import {model, Schema} from "mongoose";

const TESTER_SCHEMA: Schema = new Schema({
    name: {type: String, required: true},
},
{
    timestamps: true,
});

module.exports = model("Tester", TESTER_SCHEMA);
