import BackgroundApplication from "./application/BackgroundApplication";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import ChromeBrowserService from "./_infra/ChromeBrowserService";
import HandlerOfMessageSentByPopup from "./_ui/HandlerOfMessageSentByPopup";
import HandlerOfMessageSentByTabScript from "./_ui/HandlerOfMessageSentByTabScript";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";
import State from "./domain/State";


const browserService = new ChromeBrowserService();
const aifexService = new AifexServiceHTTP();
const application = new BackgroundApplication(browserService, aifexService);

const chromeExtensionCommunicationService = new ChromeExtensionCommunicationService();
const handlerOfMessageSentByPopup = new HandlerOfMessageSentByPopup(application);
const handlerOfMessageSentTabScript = new HandlerOfMessageSentByTabScript(application);

handlerOfMessageSentByPopup.attachCommunicationService(chromeExtensionCommunicationService);
handlerOfMessageSentTabScript.attachCommunicationService(chromeExtensionCommunicationService);

(async () => {
    console.log('build at ', new Date());
    let state : State | undefined;
    state = await browserService.getStateFromStorage(); 
    console.log('just after construct, state from storage is ', state);
    if (! state) {
        console.log('no state in storage, will create new one and store it ! ');
        await browserService.setStateToStorage(new State());
        console.log('state is saved');
        state = await browserService.getStateFromStorage(); 
        console.log('state from storage', state);
    }
})();