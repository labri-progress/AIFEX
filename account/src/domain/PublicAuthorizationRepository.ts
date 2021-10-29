import Authorization from './Authorization';

export default interface PublicAuthorizationRepository {
    makeAuthorizationPublic(authorization: Authorization): Promise<"AuthorizationIsPublic">;
    revokePublicAuthorization(authorization: Authorization): Promise<"AuthorizationIsNoMorePublic">;
    isAuthorizationPublic(authorization: Authorization): Promise<boolean>;
}
