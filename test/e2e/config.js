

const path = require("path")
let PATH_TO_EXTENSION;
let DASHBOARD_HOST;


if (process.env.NODE_ENV === 'github') {
    DASHBOARD_HOST = 'dashboard';
    PATH_TO_EXTENSION = '/browser-extension/dist/chrome';
} else {
    DASHBOARD_HOST = 'localhost';
    PATH_TO_EXTENSION = path.join(__dirname, '..', '..', 'browser-extension', 'dist', "chrome");
}

// puppeteer options
const opts = {
    executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
    headless: false,
    args:[
        `--disable-extensions-except=${PATH_TO_EXTENSION}`,
        `--load-extension=${PATH_TO_EXTENSION}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ],
    //slowMo: 50, 
    timeout: 100000,
    headless: false,
    defaultViewport: {
        width: 800, 
        height: 1000
    }
};

module.exports = {
    PUPPETEER_OPTIONS: opts,
    DASHBOARD_HOST,
}