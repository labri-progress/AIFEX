import Action from "./Action";
import Exploration from "./Exploration";
import Session from "./Session";

export default interface IPrinter {
    printSession(session: Session, options? : {
        headless?: boolean,
        timeout?: number,
    }): string | undefined;

    printExploration(exploration: Exploration, session: Session, options : any): string | undefined;

    printAction(action: Action, session: Session, options : any): string | undefined;
}
