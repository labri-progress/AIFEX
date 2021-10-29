import TabScriptService from "./application/TabScriptService";
import FirefoxBackgroundMessageService from "./_infra/FirefoxBackgroundMessageService";
import FirefoxExtensionCommunicationService from "./_infra/FirefoxExtensionCommunicationService";
import HandlerOfMessageSentByBackground from "./_ui/HandlerOfMessageSentByBackground";
import {logger} from "./framework/Logger";
import HighlighterCanvas from "./_infra/HighlighterCanvas";
import ActionsPopup from "./_infra/ActionPopup";
import ActionHighlighter from "./_infra/ActionHighlighter";
import EvaluationHighlighter from "./_infra/EvaluationHighlighter";
import Highlighter from "./domain/Highlighter";

logger.info("AIFEX script is running.")

const backgroundService = new FirefoxBackgroundMessageService();
const highlighterCanvas = new HighlighterCanvas();
const highlighterPopup = new ActionsPopup();
const highlighterAction = new ActionHighlighter(highlighterCanvas);
const highlighterEvaluation = new EvaluationHighlighter(highlighterCanvas);
const highlighter = new Highlighter(highlighterCanvas, highlighterPopup, highlighterAction, highlighterEvaluation);

const tabScriptService = new TabScriptService(backgroundService, highlighter);


const communicationService = new FirefoxExtensionCommunicationService();
const handler = new HandlerOfMessageSentByBackground(tabScriptService);
handler.attachCommunicationService(communicationService);

tabScriptService.synchronizeWithBackground();




//    eventListener.addNewActionCallback(() => styleApplication.onActionPushed);
