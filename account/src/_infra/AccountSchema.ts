import { model, Schema, Document} from 'mongoose';

const ACCOUNT_SCHEMA = new Schema({
    username : {type : String, required : true},
    email : {type : String, required : true},
    salt : [{type : Number, required : true}],
    hash : [{type : Number, required : true}],
    authorizationSet: {type : Array},
},
{
    timestamps: true,
});

export interface AccountDocument extends Document {
    username : string,
    email : string,
    salt : number[],
    hash : number[],
    authorizationSet: {kind: number, key: string}[]
}

export default model<AccountDocument>("Account", ACCOUNT_SCHEMA);
