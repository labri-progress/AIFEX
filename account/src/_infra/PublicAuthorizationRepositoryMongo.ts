import Authorization from "../domain/Authorization";
import PublicAuthorizationRepository from "../domain/PublicAuthorizationRepository";
import PublicAuhorizationModel, { PublicAuthorizationDocument } from "./PublicAuthorizationSchema";

export default class PublicAuthorizationRepositoryMongo implements PublicAuthorizationRepository {

    makeAuthorizationPublic(authorization: Authorization): Promise<"AuthorizationIsPublic"> {
        return PublicAuhorizationModel.create({
            kind: authorization.kind,
            key: authorization.key,
        })
            .then(() => "AuthorizationIsPublic");
    }

    revokePublicAuthorization(authorization: Authorization): Promise<"AuthorizationIsNoMorePublic"> {
        return PublicAuhorizationModel.findOneAndRemove({
            kind: authorization.kind,
            key: authorization.key
        }) 
            .then(() => "AuthorizationIsNoMorePublic");
    }

    isAuthorizationPublic(authorization: Authorization): Promise<boolean> {
        return PublicAuhorizationModel.findOne({
            kind: authorization.kind,
            key: authorization.key
        })
            .then((publicAuthorization: PublicAuthorizationDocument | null) => {
                return !!publicAuthorization;
            }
        );
    }
}