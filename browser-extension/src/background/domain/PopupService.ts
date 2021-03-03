import StateForPopup from "./StateForPopup";

export default interface PopupService {

    refresh(state: StateForPopup): Promise<void>;

}