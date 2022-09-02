import TabScriptService from "./application/TabScriptService";
import ChromeBackgroundMessageService from "./_infra/ChromeBackgroundMessageService";

import {logger} from "./framework/Logger";
import ChromeBrowserService from "./_infra/ChromeBrowserService";

logger.info("AIFEX script is running.")

const backgroundService = new ChromeBackgroundMessageService();
const browserService = new ChromeBrowserService();


const tabScriptService = new TabScriptService(backgroundService, browserService);

