import EventListener from "./domain/EventListener";
import {logger} from "./framework/Logger";
import AifexServiceHTTP from "./_infra/AifexServiceHTTP";
import BrowserServiceLocalStorage from "./_infra/BrowserServiceLocalStorage";
import BrowserServiceSessionStorage from "./_infra/BrowserServiceSessionStorage";

logger.info("AIFEX script is running.");

const AIFEX_SCRIPT = document.getElementById("AIFEX");
if (AIFEX_SCRIPT) {
    logger.info("AIFEX SCRIPT Element is found.");
    const CONNEXION_URL = AIFEX_SCRIPT.getAttribute("connexion-url");
    if (CONNEXION_URL) {
        logger.info("AIFEX connexion-url Element is found.");
        try {
            const AIFEX_URL = new URL(CONNEXION_URL);
			let sessionId = AIFEX_URL.searchParams.get('sessionId');
			if (sessionId) {
                logger.info("AIFEX sessionId is found.");
                const AIFEX_SERVICE = new AifexServiceHTTP();
                const BROWSER_SERVICE = new BrowserServiceSessionStorage();
                const EVENT_LISTENER = new EventListener(AIFEX_URL.origin, sessionId, AIFEX_SERVICE, BROWSER_SERVICE);
                
			}
        } catch (e) {
            logger.error("Invalid connexion URL", new Error("Invalid connexion URL"));
        }
    }
} else {
    logger.error("AIFEX SCRIPT Element is not found.", new Error("AIFEX SCRIPT Element is not found."));
}

// <script id="AIFEX" connexion-url="https://aifex.com/aifex/connexion?sessionId=a1b2c3d4e5f6g7h8i9j0" src="https://aifex.com/aifex/script/aifex.js"></script>