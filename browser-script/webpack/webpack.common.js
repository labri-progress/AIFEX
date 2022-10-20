const path = require("path");

module.exports = {
	context: path.resolve(__dirname, ".."),
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "AIFEXScript.js",
	},
	resolve: {
		extensions: [".js", ".tsx", ".ts"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: "ts-loader"
			},

		],
	}
};