import TabScriptService from "./application/TabScriptService";
import ChromeBackgroundMessageService from "./_infra/ChromeBackgroundMessageService";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";
import HandlerOfMessageSentByBackground from "./_ui/HandlerOfMessageSentByBackground";

import {logger} from "./framework/Logger";
import Highlighter from "./_infra/Highlighter";

logger.info("AIFEX script is running.")

const backgroundService = new ChromeBackgroundMessageService();
const tabScriptService = new TabScriptService(backgroundService);
tabScriptService.setViewManager(new Highlighter());

const communicationService = new ChromeExtensionCommunicationService();

const handler = new HandlerOfMessageSentByBackground(tabScriptService);
handler.attachCommunicationService(communicationService);

tabScriptService.synchronizeWithBackground();
