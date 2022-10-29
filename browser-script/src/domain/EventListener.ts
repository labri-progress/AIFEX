import AifexService from "./AifexService"
import Action from "./Action";
import getCssSelector from 'css-selector-generator';
import BrowserService from "./BrowserService";
import { logger } from "../framework/Logger";

export default class EventListener {
    private _serverURL: string;
	private _sessionId: string;
    private _explorationNumber: number | undefined;
    private _aifexService: AifexService;
    private _browserService : BrowserService;
    private _lastAction: string | undefined;

    constructor(serverURL: string, sessionId: string, aifexService: AifexService, browserService: BrowserService) {
        this._serverURL = serverURL;
        this._sessionId = sessionId;
        this._aifexService = aifexService;
        this._browserService = browserService;
        

        let explorationNumber = this._browserService.getExplorationNumber();    
        if (explorationNumber === undefined) {
            this._aifexService.createEmptyExploration("browser-script", this._serverURL, this._sessionId)
            .then((result) => {
                this._browserService.saveExplorationNumber(result);
                this._explorationNumber = result;
                this.listen();
            })
        } else {
            this._explorationNumber = explorationNumber;
            this.listen();
        }        
            
    }


    private listen(): void {
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

                
                if (this._lastAction !== action.toString()) {
                    this._lastAction = action.toString();
                    if (this._explorationNumber !== undefined) {
                        logger.debug(`action : ${action.toString()}`);
                        this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId).then(()=>{}).catch(()=>{});
                    }
                }
            }
            unsafeEvent.explored = true;
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
                
                if (this._lastAction !== action.toString()) {
                    this._lastAction = action.toString();
                    if (this._explorationNumber !== undefined) {
                        this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId).then(()=>{}).catch(()=>{});
                    }
                }
            }
            unsafeEvent.explored = true;
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
                        maxCandidates: 80,
                        maxCombinations: 80
                    });
                } catch (e) {
                    suffix = "error";
                    logger.debug(`[TabScript] exception while generating suffix : ${e}`);
                }

                suffix += `?href=${window.location.href}`;

                const rect = event.target.getBoundingClientRect();
                if (rect) {
                    suffix +=`&left=${rect.left}&top=${rect.top}&right=${rect.right}&bottom=${rect.bottom}&width=${rect.width}&height=${rect.height}&screenwidth=${window.innerWidth}&screenheight=${window.innerHeight}`;
                }
                return suffix;
            }
        }
    }

}
