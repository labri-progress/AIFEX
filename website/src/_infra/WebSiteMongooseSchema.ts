import mongoose, { Document } from "mongoose";
const Schema = mongoose.Schema;

const MAPPING_SCHEMA = new Schema({
    match:  { type: {
        code: String,
        key: String,
        event: { type: String, required: true},
        css: String,
        xpath: String,
    }},
    output: {type: {
            prefix: {type: String, required: true},
            suffix: String,
        }
    },
    context: {type: {
        url: String,
        css: String,
        xpath: String
    }},
    description: String
},
{
    timestamps: true,
});

const WEBSITE_SCHEMA = new Schema({
    _id: {type: String, required: true},
    mappingList: [MAPPING_SCHEMA],
    name: {
        required: true,
        type: String
    }
},
{
    timestamps: true,
});

export interface MappingDocument {
    match:  {
        code?: string,
        key?: string,
        event: string,
        css?: string,
        xpath?: string,
    },
    output: {
        prefix: string,
        suffix?: string,
    },
    context?: {
        url?: string,
        css?: string,
        xpath?: string
    },
    description?: string
}

export interface WebSiteDocument extends Document {
    _id? : string
    mappingList: MappingDocument[],
    name: string
}

export default mongoose.model<WebSiteDocument>("WebSite", WEBSITE_SCHEMA);
