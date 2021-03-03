import Action from "./Action";
import CommentDistribution from "./CommentDistribution";
import ExplorationEvaluation from "./ExplorationEvaluation";
import PopupAction from "./PopupAction";
import WebSite from "./Website";
import Comment from "./Comment";
export default class StateForPopup {
    public serverURL: string | undefined;
    public url: string | undefined;
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
    public popupIsDetached: boolean;
    public evaluatorScenario: string | undefined;
    public commentDistributionList: CommentDistribution[];
    public commentUpList: Comment[]
    public evaluation: {
        validated: boolean
        enteringInteractionList: Action[]
        continuingActionList: Action[]
        finishingInteractionList: Action[]
    } | undefined;

    constructor() {
        this.isRecording = false;
        this.isTabScriptDisplayingUserView = false;
        this.hasBaseURL = false;
        this.interactionList = [];
        this.testerName = "MyTesterName";
        this.shouldCreateNewWindowsOnConnect = false;
        this.shouldCloseWindowOnDisconnect = false;
        this.isPreparedToRecordMedia = false;
        this.popupIsDetached = false;
        this.numberOfExplorationsMadeByTester = 0;
        this.commentDistributionList = [];
        this.commentUpList = [];
    }

    public readEvaluation(evaluation: ExplorationEvaluation, webSite: WebSite): void {
        if (webSite === undefined || evaluation === undefined) {
            return;
        }
        this.evaluation = {
            validated: evaluation.isAccepted,
            continuingActionList: evaluation.continuingActionList.map(action => this.createPopupAction(action, webSite)),
            enteringInteractionList: evaluation.enteringInteractionList.map(action => this.createPopupAction(action, webSite)),
            finishingInteractionList: evaluation.finishingInteractionList.map(action => this.createPopupAction(action, webSite))
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

