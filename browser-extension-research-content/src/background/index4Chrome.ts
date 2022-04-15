import BackgroundApplication from "./application/BackgroundApplication";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import ChromeBrowserService from "./_infra/ChromeBrowserService";
import HandlerOfMessageSentByPopup from "./_ui/HandlerOfMessageSentByPopup";
import HandlerOfMessageSentByTabScript from "./_ui/HandlerOfMessageSentByTabScript";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";


const browserService = new ChromeBrowserService();
const aifexService = new AifexServiceHTTP();
const application = new BackgroundApplication(browserService, aifexService);

const chromeExtensionCommunicationService = new ChromeExtensionCommunicationService();
const handlerOfMessageSentByPopup = new HandlerOfMessageSentByPopup(application);
const handlerOfMessageSentTabScript = new HandlerOfMessageSentByTabScript(application);

handlerOfMessageSentByPopup.attachCommunicationService(chromeExtensionCommunicationService);
handlerOfMessageSentTabScript.attachCommunicationService(chromeExtensionCommunicationService);