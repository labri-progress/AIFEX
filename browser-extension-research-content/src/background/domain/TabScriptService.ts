import StateForTabScript from "./StateForTabScript";

export default interface TabScriptService {

    startExploration(tabId : number, state : StateForTabScript) : Promise<void>;

    stopExploration(tabId : number, state : StateForTabScript) : Promise<void>;


}