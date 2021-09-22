import StateForTabScript from "./StateForTabScript";

export default interface TabScriptService {

    reload(tabId : number, state : StateForTabScript) : Promise<void>;

    startExploration(tabId : number, state : StateForTabScript) : Promise<void>;

    stopExploration(tabId : number, state : StateForTabScript) : Promise<void>;


}