# Exploratory Testing Assistant - Chrome Plugin

This project is a Chrome Plugin that helps testers to perform exploratory tests.

## Dependencies

This project depends on npm and packages provided by it. To install the dependencies:

    npm install

## Build

Webpack is used to generate a `bundled.js` file. Build the project with:

    npm run build

## Deploy

The unpacked **Chrome extension** is stored in the `dist/` directory. To deploy it, you should:
1. Launch Chrome
2. Open the extension from the Chrome menu
3. [Load the unpacked extension](https://developer.chrome.com/extensions/getstarted)

## Run

Before to run the plugin, you should run the [server](https://github.com/labri-progress/ExploratoryTesting)

Then click on the extension icon : 
![Plugin Icon](/src/plugin_icon.png)

## Configure

See our [guide](./SITE.md) to configure our plugin.
