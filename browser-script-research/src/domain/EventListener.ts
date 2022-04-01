import Action from "./Action";
import { logger } from "../framework/Logger";
import getCssSelector from 'css-selector-generator';
import AifexService from "./AifexService";
import html2canvas from 'html2canvas';
import Screenshot from "./Screenshot";
import BrowserService from "./BrowserService";

export default class EventListener {
    
    private _aifexService: AifexService;
    private _browserService: BrowserService;
    private _explorationNumber: number;
    private _interactionIndex: number;
    private _serverURL: string;
	private _sessionId: string;

    constructor(aifexService: AifexService, browserService: BrowserService, explorationNumber: number, interactionIndex: number, serverURL: string, sessionId: string) {
        this._aifexService = aifexService;
        this._browserService = browserService;
        this._explorationNumber = explorationNumber;
        this._interactionIndex = interactionIndex;
        this._serverURL = serverURL;
        this._sessionId = sessionId;
    }

    public listen(): void {
        logger.debug(`listening to events`);
        document.addEventListener('mousedown', this.listenToMouseDown.bind(this), true);
        document.addEventListener('keydown', this.listenToKeyDown.bind(this), true);
    }

    private listenToMouseDown(event: Event): void {
        let unsafeEvent: any = event;
        if (!unsafeEvent.explored) {
            if (event instanceof MouseEvent) {
                let prefix = 'Click';
                let suffix = this.makeSuffix(event);
                let action = new Action(prefix, suffix);

                logger.info(`action : ${action.toString()}`);
                this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId)
                    .then(() => {
                        logger.debug(`action sent`);
                        this._interactionIndex++;
                        this._browserService.saveInteractionIndex(this._interactionIndex);
                        return html2canvas(document.body);
                    })
                    .then((canvas) => {
                        const base64image = canvas.toDataURL("image/png");
                        let screenshot = new Screenshot(base64image, this._interactionIndex - 1);
                        logger.debug(`image sent`);
                        return this._aifexService.sendScreenshot(this._serverURL, this._sessionId, this._explorationNumber, screenshot);
                    })
                    .catch((error) => {
                        logger.error('Error while Listener pushed action ', error);
                    })
            }
        }
    }


    private listenToKeyDown(event: Event): void {
        let unsafeEvent: any = event;
        if (!unsafeEvent.explored) {
            if (event instanceof KeyboardEvent) {
                let prefix = 'Edit';
                let isEditable = false;
                if (event.target instanceof HTMLInputElement && !event.target.disabled && !event.target.readOnly) {
                    isEditable = true;
                }

                
                switch (event.code) {
                    case 'Tab':
                        if (event.shiftKey){
                            prefix = 'ShiftTab';
                        } else {
                            prefix = 'Tab';
                        }
                        break;
                    case 'Enter':
                        if (isEditable) {
                            prefix = 'Edit';
                        } else {
                            prefix = 'Enter';
                        }
                        break;
                    case 'Space':
                        if (isEditable) {
                            prefix = 'Edit';
                        } else {
                            prefix = 'Space';
                        }
                        break;
                    case 'ArrowUp':
                    case 'ArrowDown':
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        prefix = event.code;
                        break;
                    case 'Escape':
                        prefix = 'Escape';
                        break;
                    default:
                        prefix = 'Edit';

                }

                let suffix = this.makeSuffix(event);
                let action = new Action(prefix, suffix);
                logger.info(`action : ${action.toString()}`);
                this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId)
                    .then(() => {
                        this._interactionIndex++;
                        this._browserService.saveInteractionIndex(this._interactionIndex);
                        return html2canvas(document.body);
                    })
                    .then((canvas) => {
                        const base64image = canvas.toDataURL("image/png");
                        let screenshot = new Screenshot(base64image, this._interactionIndex - 1);
                        return this._aifexService.sendScreenshot(this._serverURL, this._sessionId, this._explorationNumber, screenshot);
                    })
                    .catch((error) => {
                        logger.error('Error while Listener pushed action ', error);
                    })
            }
        }
    }


    makeSuffix(event : Event): string | undefined {
        if (event.target) {
            if (event.target instanceof HTMLElement || event.target instanceof SVGElement) { 
                let suffix;
                try {
                    suffix = getCssSelector(event.target, {
                        selectors: [
                            "id", 
                            "class", 
                            "tag", 
                            "attribute"
                        ], 
                        blacklist: [
                            /.*data.*/i, 
                            /.*aifex.*/i, 
                            /.*over.*/i,
                            /.*auto.*/i,
                            /.*value.*/i,
                            /.*checked.*/i,
                            '[placeholder]',
                            /.*href.*/i,
                            /.*src.*/i,
                            /.*onclick.*/i,
                            /.*onload.*/i,
                            /.*onkeyup.*/i,
                            /.*width.*/i,
                            /.*height.*/i,
                            /.*style.*/i,
                            /.*size.*/i,
                            /.*maxlength.*/i
                        ],
                        combineBetweenSelectors: true,
                        maxCandidates: 100
                    });
                } catch (e) {
                    logger.error(`exception`,new Error('css exception'));
                }

                const rect = event.target.getBoundingClientRect();
                if (rect) {
                    suffix +=`?left=${rect.left}&top=${rect.top}&right=${rect.right}&bottom=${rect.bottom}&width=${rect.width}&height=${rect.height}&screenwidth=${window.innerWidth}&screenheight=${window.innerHeight}`;
                }
                return suffix;
            }
        }
    }
    
}
