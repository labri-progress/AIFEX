import TabScriptService from "./application/TabScriptService";
import FirefoxBackgroundMessageService from "./_infra/FirefoxBackgroundMessageService";
import FirefoxExtensionCommunicationService from "./_infra/FirefoxExtensionCommunicationService";
import HandlerOfMessageSentByBackground from "./_ui/HandlerOfMessageSentByBackground";

console.log("AIFEX script is running.")

const backgroundService = new FirefoxBackgroundMessageService();

const tabScriptService = new TabScriptService(backgroundService);


const communicationService = new FirefoxExtensionCommunicationService();
const handler = new HandlerOfMessageSentByBackground(tabScriptService);
handler.attachCommunicationService(communicationService);

tabScriptService.synchronizeWithBackground();




//    eventListener.addNewActionCallback(() => styleApplication.onActionPushed);
