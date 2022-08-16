import Action from "./Action";
import { PopupPageKind } from "./PopupPageKind";
export default class StateForPopup {
    public pageKind: PopupPageKind;
    public showConfig: boolean;
    public serverURL: string | undefined;
    public url: string | undefined;
    public followedConnection : string | undefined;
    public numberOfExplorationsMadeByTester : number;
    public isRecording : boolean;
    public testerName : string;
    public hasBaseURL : boolean;
    public managedWindowId : number | undefined;
    public interactionList : string[];
    public shouldCreateNewWindowsOnConnect : boolean;
    public shouldCloseWindowOnDisconnect : boolean;
    public shouldOpenPrivateWindows : boolean;
    public takeAScreenshotByAction: boolean;
    public sessionDescription: string | undefined;

    constructor() {
        this.pageKind = PopupPageKind.Home;
        this.showConfig = false;
        this.isRecording = false;
        this.hasBaseURL = false;
        this.interactionList = [];
        this.testerName = "MyTesterName";
        this.shouldCreateNewWindowsOnConnect = false;
        this.shouldCloseWindowOnDisconnect = false;
        this.shouldOpenPrivateWindows = false;
        this.takeAScreenshotByAction = false;
        this.numberOfExplorationsMadeByTester = 0;
    }


}

