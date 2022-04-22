import TabScriptService from "./application/TabScriptService";
import ChromeBrowserService from "./_infra/ChromeBrowserService";
import ChromeBackgroundService from "./_infra/ChromeBackgroundService";


console.log("[TabScript] TabScript is running");
const backgroundService = new ChromeBackgroundService();
const browserService = new ChromeBrowserService();

const tabScriptService = new TabScriptService(backgroundService, browserService);

tabScriptService.synchronizeWithState();
