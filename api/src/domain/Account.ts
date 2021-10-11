import Authorization from "./Authorization";
import Invitation from "./Invitation";

export default class Account  {
    readonly username : string;//id
    readonly authorizationSet : Authorization[];
    readonly receivedInvitationSet: Invitation[];
    readonly sentInvitationSet: Invitation[];

    constructor(username : string, authorizationSet: Authorization[], receivedInvitationSet: Invitation[], sendInvitationSet: Invitation[]) {
        this.username = username;
        this.authorizationSet = authorizationSet;
        this.receivedInvitationSet = receivedInvitationSet;
        this.sentInvitationSet = sendInvitationSet;
    }

}