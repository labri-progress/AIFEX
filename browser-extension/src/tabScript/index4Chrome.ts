import ChromeBackgroundMessageService from "./_infra/ChromeBackgroundMessageService";

import {logger} from "./framework/Logger";
import ChromeBrowserService from "./_infra/ChromeBrowserService";
import EventListener from "./domain/EventListener";
import Highlighter from "./domain/Highlighter";

logger.info("AIFEX script is running.")

const backgroundService = new ChromeBackgroundMessageService();
const browserService = new ChromeBrowserService();

const eventListener = new EventListener(backgroundService, browserService);
const highlighter = new Highlighter(browserService);

