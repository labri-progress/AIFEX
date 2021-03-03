import BackgroundApplication from "./application/BackgroundApplication";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import HandlerOfMessageSentByPopup from "./_ui/HandlerOfMessageSentByPopup";
import ChromeTabScriptService from "./_infra/ChromeTabScriptService";
import HandlerOfMessageSentByTabScript from "./_ui/HandlerOfMessageSentByTabScript";
import FirefoxExtensionCommunicationService from "./_infra/FirefoxExtensionCommunicationService";
import FirefoxBrowserService from "./_infra/FirefoxBrowserService";
import FirefoxPopupService from "./_infra/FirefoxPopupService";

const browserService = new FirefoxBrowserService();
const aifexService = new AifexServiceHTTP();
const tabScriptService = new ChromeTabScriptService();
const popupService = new FirefoxPopupService();

const application = new BackgroundApplication(browserService, popupService, aifexService, tabScriptService);

const communicationService = new FirefoxExtensionCommunicationService();
const handlerOfMessageSentByPopup = new HandlerOfMessageSentByPopup(application);
const handlerOfMessageSentTabScript = new HandlerOfMessageSentByTabScript(application);

handlerOfMessageSentByPopup.attachCommunicationService(communicationService);
handlerOfMessageSentTabScript.attachCommunicationService(communicationService);