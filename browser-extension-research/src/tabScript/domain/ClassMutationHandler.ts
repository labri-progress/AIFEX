import { logger } from "../framework/Logger";

export default class ClassMutationHandler {

    private _observer: MutationObserver;

    constructor() {
        this._observer = new MutationObserver((records) => {
            for (const record of records) {
                if (record.type === "attributes") {
                    if (record.attributeName === "class") {
                        if (record.target instanceof HTMLElement) {
                            logger.debug('class mutation');
                            if (record.target.matches(':hover')) {
                                let currentClass = record.target.getAttribute('class');
                                let createEvent = false;
                                if (record.oldValue) {
                                    if (currentClass && currentClass.includes(record.oldValue)) {
                                        createEvent = true;
                                    }
                                } else {
                                    if (currentClass) {
                                        createEvent = true;
                                    }
                                }
                                if (createEvent ) {
                                    logger.debug('create event');
                                    let event = new Event('css-class-added',{bubbles:true});
                                    record.target.dispatchEvent(event);
                                }
                            }
                        }
                    } 
                }
            }
        });
        const config = { attributes: true, subtree: true, attributeOldValue: true};
        this._observer.observe(document.body, config);
        logger.info('class mutation handler initialized');
    }

}