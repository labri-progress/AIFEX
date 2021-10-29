import Authorization from "./Authorization";

export default class Invitation {
    readonly fromUsername: string;
    readonly toUsername: string;
    readonly authorization: Authorization;

    constructor(fromUsername: string, toUsername: string, authorization: Authorization) {
        this.fromUsername = fromUsername;
        this.toUsername = toUsername;
        this.authorization = authorization;
    }

}