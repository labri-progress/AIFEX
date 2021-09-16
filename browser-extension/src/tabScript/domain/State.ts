import Exploration from "../../background/domain/Exploration";
import Action from "./Action";
import Comment from "./Comment";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isActive: boolean;
    nextActions: Action[];
    confirmedComments: Comment[];
    userTabPosition: {x: string, y: string};
    displayUserView: boolean;

    elementActionListMap: Map<HTMLElement, Action[]>;
    commentList: Comment[];
    webSite: any;
    overlayType: OverlayType;

    //REMOVE THIS LINE
    exploration: Exploration;

    constructor(confirmedComments : Comment[] = [], displayUserView: boolean, isActive: boolean= false, webSite : any, userTabPosition : {x: string, y: string}, overlayType: OverlayType, exploration: Exploration) {
        this.isActive = isActive;
        this.displayUserView = displayUserView;
        this.nextActions = [];
        this.webSite = webSite;
        this.commentList = [];
        this.confirmedComments = confirmedComments;
        this.overlayType = overlayType;
        this.userTabPosition = userTabPosition;
        this.elementActionListMap = new Map();
        this.exploration = exploration
    }
}