import TabScriptService from "./application/TabScriptService";
import ChromeBackgroundMessageService from "./_infra/ChromeBackgroundMessageService";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";
import HandlerOfMessageSentByBackground from "./_ui/HandlerOfMessageSentByBackground";


console.log("AIFEX is running");
const backgroundService = new ChromeBackgroundMessageService();

const tabScriptService = new TabScriptService(backgroundService);

const communicationService = new ChromeExtensionCommunicationService();

const handler = new HandlerOfMessageSentByBackground(tabScriptService);
handler.attachCommunicationService(communicationService);

tabScriptService.synchronizeWithBackground();
