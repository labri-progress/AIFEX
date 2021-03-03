const path = require("path");
const baseConfig = require("./base.config");

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

