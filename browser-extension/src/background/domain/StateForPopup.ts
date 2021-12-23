import Action from "./Action";
import CommentDistribution from "./CommentDistribution";
import ExplorationEvaluation from "./ExplorationEvaluation";
import PopupAction from "./PopupAction";
import WebSite from "./Website";
import Comment from "./Comment";
import Token from "./Token";
import { PopupPageKind } from "./PopupPageKind";
export default class StateForPopup {
    public pageKind: PopupPageKind;
    public showConfig: boolean;
    public serverURL: string | undefined;
    public url: string | undefined;
    public token: Token | undefined;
    public followedConnection : string | undefined;
    public numberOfExplorationsMadeByTester : number;
    public isRecording : boolean;
    public testerName : string;
    public isTabScriptDisplayingUserView : boolean;
    public hasBaseURL : boolean;
    public managedWindowId : number | undefined;
    public interactionList : string[];
    public isPreparedToRecordMedia : boolean;
    public shouldCreateNewWindowsOnConnect : boolean;
    public shouldCloseWindowOnDisconnect : boolean;
    public shouldOpenPrivateWindows : boolean;
    public popupIsDetached: boolean;
    public evaluatorScenario: string | undefined;
    public commentDistributionList: CommentDistribution[];
    public commentUpList: Comment[]
    public evaluation: {
        validated: boolean
        nextActionList: Action[]
    } | undefined;
    public sessionDescription: string | undefined;
    public lastInteractionComment: Comment | undefined;

    constructor() {
        this.pageKind = PopupPageKind.Home;
        this.showConfig = false;
        this.isRecording = false;
        this.isTabScriptDisplayingUserView = false;
        this.hasBaseURL = false;
        this.interactionList = [];
        this.testerName = "MyTesterName";
        this.shouldCreateNewWindowsOnConnect = false;
        this.shouldCloseWindowOnDisconnect = false;
        this.shouldOpenPrivateWindows = false;
        this.isPreparedToRecordMedia = false;
        this.popupIsDetached = false;
        this.numberOfExplorationsMadeByTester = 0;
        this.commentDistributionList = [];
        this.commentUpList = [];
        this.lastInteractionComment = undefined;
    }

    public readEvaluation(evaluation: ExplorationEvaluation, webSite: WebSite): void {
        if (webSite === undefined || evaluation === undefined) {
            return;
        }
        this.evaluation = {
            validated: evaluation.isAccepted,
            nextActionList: evaluation.nextActionList.map(action => this.createPopupAction(action, webSite))
        };
    }

    private createPopupAction(action: Action, webSite: WebSite): PopupAction {
        const descriptions =  webSite.mappingList
        .filter(mapping => mapping.output.prefix === action.kind)
        .filter(rule => rule.description !== undefined)
        .map(rule => rule.description)
        return new PopupAction(action.kind, action.value, descriptions)
    }
}

