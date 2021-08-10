import Authorization from "./Authorization";

export default class Invitation {
    readonly username: string;
    readonly authorization: Authorization;

    constructor(username: string, authorization: Authorization) {
        this.username = username;
        this.authorization = authorization;
    }

}