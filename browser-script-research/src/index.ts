import BrowserScript from "./domain/BrowserScript";
import {logger} from "./framework/Logger";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import BrowserServiceLocalStorage from "./_infra/BrowserServiceLocalStorage";
import BrowserServiceSessionStorage from "./_infra/BrowserServiceSessionStorage";

logger.info("AIFEX script is running.");

const CONNEXION_URL = "https://www.aifex.fr/join?sessionId=pT4c7JVSj&modelId=ryhyXtXH-";
const AIFEX_URL = new URL(CONNEXION_URL);
const sessionId = AIFEX_URL.searchParams.get('sessionId');

if (sessionId) {
    const AIFEX_SERVICE = new AifexServiceHTTP();
    const BROWSER_SERVICE = new BrowserServiceSessionStorage();
    const BROWSER_SCRIPT = new BrowserScript(AIFEX_URL.origin, sessionId, undefined, AIFEX_SERVICE, BROWSER_SERVICE);
    BROWSER_SCRIPT.start();	
}

// <script id="AIFEX" connexion-url="https://aifex.com/aifex/connexion?sessionId=a1b2c3d4e5f6g7h8i9j0" src="https://aifex.com/aifex/script/aifex.js"></script>