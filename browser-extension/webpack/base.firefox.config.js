const path = require("path");
const baseConfig = require("./base.config");

const firefoxConfig = {
	entry: {
		index: "./src/background/index4Firefox.ts",
		tabScript: "./src/tabScript/index4Firefox.ts",
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "../dist/firefox"),
	}
}

Object.assign(firefoxConfig, baseConfig);
module.exports = firefoxConfig

