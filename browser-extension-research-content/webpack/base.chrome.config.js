const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const baseConfig = require("./base.config");

baseConfig.plugins.push(new CopyWebpackPlugin({
	patterns: [
		{ from: "./src/manifest.chrome.json", to: "manifest.json" },
		{ from: "./src/background/_infra/bg.html", to: "bg.html" }
	]
}));


const chromeConfig = {
	entry: {
		index: "./src/background/index4Chrome.ts",
		tabScript: "./src/tabScript/index4Chrome.ts",
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "../dist/chrome"),
	}
}

Object.assign(chromeConfig, baseConfig);
module.exports = chromeConfig

