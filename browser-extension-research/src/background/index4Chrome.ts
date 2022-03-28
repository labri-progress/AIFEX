import BackgroundApplication from "./application/BackgroundApplication";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import ChromeBrowserService from "./_infra/ChromeBrowserService";
import HandlerOfMessageSentByPopup from "./_ui/HandlerOfMessageSentByPopup";
import ChromeTabScriptService from "./_infra/ChromeTabScriptService";
import HandlerOfMessageSentByTabScript from "./_ui/HandlerOfMessageSentByTabScript";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";
import ChromePopupService from "./_infra/ChromePopupService";

const browserService = new ChromeBrowserService();
const aifexService = new AifexServiceHTTP();
const tabScriptService = new ChromeTabScriptService();
const popupService = new ChromePopupService();
const application = new BackgroundApplication(browserService, popupService, aifexService, tabScriptService);

const chromeExtensionCommunicationService = new ChromeExtensionCommunicationService();
const handlerOfMessageSentByPopup = new HandlerOfMessageSentByPopup(application);
const handlerOfMessageSentTabScript = new HandlerOfMessageSentByTabScript(application);

handlerOfMessageSentByPopup.attachCommunicationService(chromeExtensionCommunicationService);
handlerOfMessageSentTabScript.attachCommunicationService(chromeExtensionCommunicationService);