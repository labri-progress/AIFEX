import Mapping from "../domain/Mapping";
import WebSite from "../domain/WebSite";
import WebSiteRepository from "../domain/WebSiteRepository";
import IdGeneratorServiceWithShortId from "./IdGeneratorServiceWithShortId";
import WebSiteSchema from "./WebSiteMongooseSchema";
const DUPLICATE_KEY_ERROR_CODE = 11000;
const DUPLICATE_KEY_ERROR_CODE_BIS = 11000;

export default class WebSiteRepositoryMongo implements WebSiteRepository {

    public add(webSite: WebSite): Promise<string> {
        return WebSiteSchema.create({
            _id: webSite.id,
            name: webSite.name,
            url: webSite.url,
            mappingList: webSite.mappingList
        })
            .then(() => {
                return webSite.id;
            }).catch((error) => {
                if (error.code === DUPLICATE_KEY_ERROR_CODE || error.code === DUPLICATE_KEY_ERROR_CODE_BIS) {
                    throw new Error(`Website ${JSON.stringify(error.keyValue)} is already used`);
                } else {
                    throw new Error(error.message);
                }
            });
    }

    public update(webSite: WebSite): Promise<string> {
        const name = webSite.name;
        const url = webSite.url;
        const mappingList = webSite.mappingList;
        return WebSiteSchema.replaceOne({_id: webSite.id}, {name, url, mappingList})
            .exec()
            .then( () => {
                return webSite.id;
            });
    }

    public findWebSiteById(id: string): Promise<WebSite | undefined> {
        return WebSiteSchema.findOne({_id:id})
            .lean()
            .exec()
            .then( (webSiteData) => {
                if (webSiteData === null || webSiteData === undefined) {
                    return undefined;
                }
                const idGeneratorService = new IdGeneratorServiceWithShortId();
                const webSite = new WebSite(idGeneratorService, webSiteData.name, webSiteData.url, id);
                webSiteData.mappingList.forEach((mapping: Mapping) => {
                    webSite.addMapping(mapping);
                });
                return webSite;
            });
    }

}
