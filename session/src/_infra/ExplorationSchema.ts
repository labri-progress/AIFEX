import {model, Schema, Document} from "mongoose";

const INTERACTION_SCHEMA: Schema = new Schema({
    concreteType: String,
    index: Number,
    kind: String,
    value: String,
    date: Date
});

const EXPLORATION_SCHEMA: Schema = new Schema({
    sessionId : String,
    explorationNumber : Number,
    testerName : String,
    isStopped : Boolean,
    isRemoved : Boolean,
    interactionList : [INTERACTION_SCHEMA],
    startDate : Date
},
{
    timestamps: true,
});

export interface ExplorationDocument extends Document {
    _id: string;
    sessionId : string,
    explorationNumber : number,
    testerName : string,
    isStopped : boolean,
    isRemoved : boolean,
    startDate: Date,
    interactionList : (ActionDocument | ObservationDocument)[],
}

export interface ActionDocument extends Document {
        concreteType: "Action",
        index: number,
        kind: string,
        value: string | undefined,
        date: Date
}

export interface ObservationDocument extends Document {
    concreteType: "Observation",
    index: number,
    kind: "enhancement" | "bug" | "not_qualified" | "ignored",
    value: string | undefined,
    date: Date
}


export default model<ExplorationDocument>("Exploration", EXPLORATION_SCHEMA);
