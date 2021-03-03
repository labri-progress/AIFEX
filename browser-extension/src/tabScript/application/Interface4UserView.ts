import Comment from "../domain/Comment";

export default interface Interface4UserView {

  commentConfirmed(comment: Comment): Promise<void>;

  setUserViewPosition(newPosition : {x : number, y: number}): void;

}