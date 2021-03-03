import Comment from "../domain/Comment";
import Action from "../domain/Action";
import Interface4UserView from "../application/Interface4UserView";

const COMMENT_SECTION = "commentSection";
const COMMENT_SECTION_HEANDER = "commentSectionHeader";
const COMMENT_SECTION_BODY = "commentSectionBody";

export default class CommentView {

    private _application : Interface4UserView;
    private header: HTMLElement | undefined;
    private body: HTMLElement | undefined;
    private section: HTMLElement | undefined;


    constructor(application : Interface4UserView) {
        this._application = application;
    }

    clear(): void {
        if (this.section) {
            this.section.remove()
        }
        this.section = undefined;
        this.header = undefined;
        this.body = undefined;
    }

    hide(): void {
        if (this.section) {
            this.section.hidden = true;
        }
    }

    show(parent: HTMLElement, commentList: Comment[], confirmedCommentList: Comment[]): void {
        if (!this.section) {
            this.section = document.createElement("div");
            this.section.setAttribute("id", COMMENT_SECTION);

            this.header = document.createElement("div")
            this.header.setAttribute("id", COMMENT_SECTION_HEANDER);

            this.body = document.createElement("div")
            this.body.setAttribute("id", COMMENT_SECTION_BODY);

            this.section.appendChild(this.header);
            this.section.appendChild(this.body);
            parent.appendChild(this.section);
        }

        while (this.body && this.body.hasChildNodes() && this.body.firstChild) {
            this.body.firstChild.remove();
        }
        this.section.hidden = false;
        this.setCommentSectionHeader();

        if (commentList.length === 0 && this.body) {
            this.body.appendChild(document.createTextNode("There is no comment."));
        }
        for (const comment of commentList) {
            this.addCommentInCommentSection(confirmedCommentList, comment);
        }
    }


    private setCommentSectionHeader(): void {
        if (this.header) {
            while (this.header.firstElementChild && this.header.hasChildNodes()) {
                this.header.removeChild(this.header.firstElementChild);
            }
            const headerText = document.createElement("p");
            headerText.classList.add("user-view-header");
            headerText.innerText = `Comments :`;
            this.header.appendChild(headerText);
        }
    }

    private addCommentInCommentSection(commentsUp: Comment[], comment: Comment): void {
        const body = document.getElementById(COMMENT_SECTION_BODY);
        if (body) {
            const commentInfo = document.createElement("div");
            body.appendChild(commentInfo);

            const commentConfirmButton = document.createElement("button");
            if (!commentsUp.some(commentUp => commentUp.note === comment.note)) {
                commentConfirmButton.classList.add("commentUpButton");
                commentConfirmButton.innerText = "up";
                commentConfirmButton.addEventListener("click", (e) => this.confirmCommentCallback(e, comment));
                commentInfo.appendChild(commentConfirmButton);
            }

            const commentKind = document.createElement("span");
            commentKind.classList.add("commentKind");
            commentKind.innerText = comment.type;

            const commentMessage = document.createElement("span");
            commentMessage.classList.add("commentMessage");
            if (comment.note !== undefined) {
                commentMessage.innerText = comment.note;
            }
            const commentContext = document.createElement("div");
            commentContext.classList.add("commentContext");
            for (const distribution of comment.distributionList) {
                const contextDetail = document.createElement("div");
                const contextDetailOccurence = document.createElement("span");
                contextDetailOccurence.classList.add("commentOccurence");
                if (distribution.noteOccurence === 0) {
                    continue
                }
                contextDetailOccurence.innerText = `${distribution.noteOccurence} / ${distribution.occurence}̀`;
                contextDetail.appendChild(contextDetailOccurence);
                distribution.actions.forEach((action: Action) => {
                    const contextNode = document.createElement("span");
                    contextNode.classList.add("commentActionContext");
                    contextNode.innerText = action.toString();
                    contextDetail.appendChild(contextNode);
                })
                commentContext.appendChild(contextDetail);
            }

            commentInfo.appendChild(commentKind);
            commentInfo.appendChild(commentMessage);
            commentInfo.appendChild(commentContext);

        }
        

    }

    private confirmCommentCallback(e : Event, comment: Comment): void {
        e.preventDefault();
        let target : HTMLInputElement;
        if (e.target instanceof HTMLInputElement) {
            target = e.target;
            if (!target.disabled) {
                this._application.commentConfirmed(comment).then(() => {
                    target.remove();
                })
            }
        }
    }
}