import WebSite from "../domain/WebSite";
import WebSiteRepository from "../domain/WebSiteRepository";

const CACHE_SIZE = 5;

export default class WebSiteService {

    private _webSiteRepository: WebSiteRepository;
    private _mountedWebSiteList: WebSite[];

    constructor(webSiteRepository: WebSiteRepository) {
        this._webSiteRepository = webSiteRepository;
        this._mountedWebSiteList = [];
    }

    public addWebSiteInCache(webSite: WebSite): void {
        if (this._mountedWebSiteList.length >= CACHE_SIZE) {
            this._mountedWebSiteList.shift();
        }
        this._mountedWebSiteList[this._mountedWebSiteList.length] = webSite;
    }

    public createWebSite(webSite: WebSite): Promise<string> {
        this.addWebSiteInCache(webSite);
        return this._webSiteRepository.add(webSite)
        .then(webSiteId => {
            return webSiteId;
        })
    }

    public updateWebSite(webSite: WebSite): Promise<string> {
        this._mountedWebSiteList.forEach( (mounted, index, mountedList) => {
            if (mounted.id === webSite.id) {
                mountedList[index] = webSite;
            }
        })
        return this._webSiteRepository.update(webSite)
        .then(webSiteId => {
            return webSiteId;
        })
    }

    public findWebSiteById(id: string): Promise<WebSite | undefined> {
        const foundWebSite = this._mountedWebSiteList.find(webSite => webSite.id === id);
        if (foundWebSite) {
            return Promise.resolve(foundWebSite);
        }
        return this._webSiteRepository.findWebSiteById(id)
            .then( webSite => {
                if (webSite !== undefined) {
                    this.addWebSiteInCache(webSite);
                    return webSite;
                }
            });
    }
}
