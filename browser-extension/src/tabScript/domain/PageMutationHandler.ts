const MUTATION_REFRESH_CHECK = 1000;
import {logger} from "../framework/Logger";

export default class PageMutationHandler {

    lastMutation: number | undefined;
    observer: MutationObserver | undefined;
    mutationHasOccured: boolean;
    beRefreshing : boolean;
    willRefresh : boolean;

    onPageMutation: () => void;

    constructor(onPageMutation: () => void) {
        this.onPageMutation = onPageMutation
        this.beRefreshing = false;
        this.mutationHasOccured = false;
        this.willRefresh = false;
    }

    init(): void {
        this.lastMutation = Date.now();
        this.observer = new MutationObserver((records) => {
            let watchedPageHasMutated = false;
            for (const record of records) {
                if (record.type === "childList") {
                    if (this.isWatchedNodeList(record.addedNodes)) {
                        watchedPageHasMutated = true;
                    }
                }
            }
            if (watchedPageHasMutated) {
                if (! this.beRefreshing) {
                    this.beRefreshing = true;
                    this.onPageMutation();
                    setTimeout(() => {
                        this.beRefreshing = false;
                    }, MUTATION_REFRESH_CHECK);
                } else {
                    if (!this.willRefresh) {
                        this.willRefresh = true;
                        const TIME_CHECK_MULTIPLIER = 2;

                        setTimeout(() => {
                            this.beRefreshing = true;
                            this.onPageMutation();
                            setTimeout(() => {
                                this.beRefreshing = false;
                                this.willRefresh = false;
                            }, MUTATION_REFRESH_CHECK);
                        }, TIME_CHECK_MULTIPLIER * MUTATION_REFRESH_CHECK);
                    }
                }

            }
        });
        const config = { attributes: false, childList: true, characterData: false, subtree: true};
        this.observer.observe(document.body, config);
    }

    private isWatchedNodeList(nodeList : NodeList) : boolean {
        let isWatched : boolean = false;
        nodeList.forEach(node => {
            if (node instanceof HTMLElement) {
                if (node.tagName !== "SCRIPT" && node.tagName !== "IFRAME" && node.tagName !== "IMG") {
                    if (!node.style) {
                        isWatched = true;
                    }
                    if (!node.style.display) {
                        isWatched = true;
                    }
                    if (node.style.display !== "none") {
                        isWatched = true;
                    }
                }
            }
        })
        return isWatched;
    }
}