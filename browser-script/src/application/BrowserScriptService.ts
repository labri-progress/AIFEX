import AifexService from "../domain/AifexService";
import EventLister from "../domain/EventListener";
import RuleService from "../domain/RuleService";
import AifexServiceHTTP from "../_infra/AIFEXService";

export default class BrowserScriptService {

    private eventListener: EventLister;
    private ruleService: RuleService;
    private aifexService: AifexService;

    public constructor() {
        this.ruleService = new RuleService();
        this.aifexService = new AifexServiceHTTP();
        this.eventListener = new EventLister(this.ruleService, this.aifexService);
        this.eventListener.onNewUserAction
    }

}