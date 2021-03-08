import jsonwebtoken  from "jsonwebtoken";


const SECRET = "not really secret";

const KIND_WEBSITE = 2;
const KIND_SESSION = 1;
const KIND_MODEL = 0;

export default class Token  {

    public token : string;
    
    constructor(token : string) {
        this.token = token;
    }

    private token2Kind(token, kind) {
        if (token === null && token === undefined) {
            return [];
        }
        let payload: any = jsonwebtoken.verify(token, SECRET);
        return payload.authorizationSet.filter(authorization => authorization._kind == kind).map(authorization => authorization._key);
    }

    getWebsiteIdListFromToken(): string[] {
        const webSiteIdList = this.token2Kind(this.token, KIND_WEBSITE);
        return webSiteIdList;
    }

    getSessionIdListFromToken(): string[] {
        const sessionIdList = this.token2Kind(this.token, KIND_SESSION);
        return sessionIdList;
    }

    getModelIdListFromToken(): string[] {
        const modelIdList = this.token2Kind(this.token, KIND_MODEL);
        return modelIdList;
    }


}

