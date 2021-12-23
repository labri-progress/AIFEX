import TabScriptService from "./application/TabScriptService";
import ChromeBackgroundMessageService from "./_infra/ChromeBackgroundMessageService";
import ChromeExtensionCommunicationService from "./_infra/ChromeExtensionCommunicationService";
import HandlerOfMessageSentByBackground from "./_ui/HandlerOfMessageSentByBackground";

import {logger} from "./framework/Logger";
import ActionHighlighter from "./_infra/ActionHighlighter";
import HighlighterCanvas from "./_infra/HighlighterCanvas";
import EvaluationHighlighter from "./_infra/EvaluationHighlighter";
import Highlighter from "./domain/Highlighter";

logger.info("AIFEX script is running.")

const backgroundService = new ChromeBackgroundMessageService();

const highlighterCanvas = new HighlighterCanvas();
const highlighterAction = new ActionHighlighter(highlighterCanvas);
const highlighterEvaluation = new EvaluationHighlighter(highlighterCanvas);
const highlighter = new Highlighter(highlighterCanvas, highlighterAction, highlighterEvaluation);

const tabScriptService = new TabScriptService(backgroundService, highlighter);

const communicationService = new ChromeExtensionCommunicationService();

const handler = new HandlerOfMessageSentByBackground(tabScriptService);
handler.attachCommunicationService(communicationService);

tabScriptService.synchronizeWithBackground();
