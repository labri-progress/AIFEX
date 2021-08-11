import { model, Schema, Document} from 'mongoose';
import { Kind } from '../domain/Kind';


const PUBLIC_AUTHORIZATION_SCHEMA = new Schema({
    kind : {type : String, required : true},
    key : {type : String, required : true}
},
{
    timestamps: true,
});

export interface PublicAuthorizationDocument extends Document {
    kind : Kind,
    key : string
}

export default model<PublicAuthorizationDocument>("PublicAuthorization", PUBLIC_AUTHORIZATION_SCHEMA);
