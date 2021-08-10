import Authorization from "./Authorization";
import Invitation from "./Invitation";

export default class Account {
    private _username: string;//id
    private _email: string;
    private _salt: Uint8Array;
    private _hash: Uint8Array;
    private _authorizationSet: Authorization[];
    private _receivedInvitations: Invitation[];
    private _sentInvitationSet: Invitation[];


    constructor(username: string, email: string, salt: Uint8Array, hash: Uint8Array) {
        this._username = username;
        this._email = email;
        this._salt = salt;
        this._hash = hash;
        this._authorizationSet = [];
        this._receivedInvitations = [];
        this._sentInvitationSet = [];
    }

    get username(): string {
        return this._username;
    }

    get email(): string {
        return this._email;
    }

    get salt(): Uint8Array {
        return this._salt;
    }

    get hash(): Uint8Array {
        return this._hash;
    }

    get authorizationSet(): Authorization[] {
        return [...this._authorizationSet];
    }

    get sendInvitationSet(): Invitation[] {
        return [...this._sentInvitationSet];
    }

    get receivedInvitationSet(): Invitation[] {
        return [...this._receivedInvitations];
    }

    addAuthorization(newAuthorization: Authorization): void {
        if (!this._authorizationSet.find(authorization => authorization.key === newAuthorization.key)) {
            this._authorizationSet.push(newAuthorization);
        }
    }

    removeAuthorization(existingAuthorization: Authorization): void {
        const index = this._authorizationSet.findIndex(authorization => {
            const sameKey = (authorization.key === existingAuthorization.key);
            const sameKind = (authorization.kind === existingAuthorization.kind);
            return sameKey && sameKind;
        });

        if (index !== -1) {
            this._authorizationSet.splice(index, 1);
        }
    }

    addReceivedInvitation(newInvitation: Invitation): void {
        const invitation = this._receivedInvitations.find(invitation => {
            const sameUsername = invitation.username === newInvitation.username;
            const sameKey = invitation.authorization.key === newInvitation.authorization.key;
            const sameKind = invitation.authorization.kind === newInvitation.authorization.kind;
            return sameUsername && sameKey && sameKind;
        });
        
        if (invitation) {
            this._receivedInvitations.push(newInvitation);
        }
    }

    removeReceivedInvitation(existingInvitation: Invitation): void {
        const index = this._receivedInvitations.findIndex(invitation => {
            const sameUsername = (invitation.username === existingInvitation.username);
            const sameKey = (invitation.authorization.key === existingInvitation.authorization.key);
            const sameKind = (invitation.authorization.kind === existingInvitation.authorization.kind);
            return sameUsername && sameKey && sameKind;
        });

        if (index !== -1) {
            this._receivedInvitations.splice(index, 1);
        }
    }

    addSentInvitation(newInvitation: Invitation): void {
        const invitation = this._sentInvitationSet.find(invitation => {
            const sameUsername = invitation.username === newInvitation.username;
            const sameKey = invitation.authorization.key === newInvitation.authorization.key;
            const sameKind = invitation.authorization.kind === newInvitation.authorization.kind;
            return sameUsername && sameKey && sameKind;
        });
        
        if (invitation) {
            this._sentInvitationSet.push(newInvitation);
        }
    }

    removeSentInvitation(existingInvitation: Invitation): void {
        const index = this._sentInvitationSet.findIndex(invitation => {
            const sameUsername = (invitation.username === existingInvitation.username);
            const sameKey = (invitation.authorization.key === existingInvitation.authorization.key);
            const sameKind = (invitation.authorization.kind === existingInvitation.authorization.kind);
            return sameUsername && sameKey && sameKind;
        });

        if (index !== -1) {
            this._sentInvitationSet.splice(index, 1);
        }
    }


}