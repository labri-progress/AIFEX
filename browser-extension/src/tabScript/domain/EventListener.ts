import BackgroundService from "./BackgroundService"
import Action from "./Action";
import getCssSelector from 'css-selector-generator';
import BrowserService from "./BrowserService";
import State from "./State";

export default class EventListener {
    private _backgroundService: BackgroundService;
    private _browserService : BrowserService;
    private _lastAction: string | undefined;

    constructor(backgroundService: BackgroundService, browserService: BrowserService) {
        this._backgroundService = backgroundService;
        this._browserService = browserService;
        this._browserService.addListenerToChangeInState((oldState, newState) => {
            if (oldState.isRecording === true && newState.isRecording === false) {
                this.unlisten();
            }
            if (oldState.isRecording === false && newState.isRecording === true) {
                this.listen();
            }
        })
        this._browserService.getStateFromStorage()
            .then((state: State) => {
                if (state.isRecording) {
                    this.listen();
                }
            })
    }


    private listen(): void {
        console.log(`[TabScript] listening to events`);
        document.addEventListener('mousedown', this.listenToMouseDown.bind(this), true);
        document.addEventListener('keydown', this.listenToKeyDown.bind(this), true);
    }

    private unlisten(): void {
        console.log("[TabScript] does not record event");
        document.removeEventListener('mousedown', this.listenToMouseDown.bind(this), true);
        document.removeEventListener('keydown', this.listenToKeyDown.bind(this), true);
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
                    this._backgroundService.sendAction(action);
                }
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
                
                if (this._lastAction !== action.toString()) {
                    this._lastAction = action.toString();
                    this._backgroundService.sendAction(action);
                }
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
                        maxCandidates: 80,
                        maxCombinations: 80
                    });
                } catch (e) {
                    suffix = "error";
                    console.log(`[TabScript] exception while generating suffix : ${e}`);
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
