const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
	context: path.resolve(__dirname, ".."),
	devtool: "inline-source-map",
	resolve: {
		extensions: [".js", ".tsx", ".ts"],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [{ loader: "style-loader" }, { loader: "css-loader" }],
			},
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
			{ from: "./src/manifest.chrome.json", to: "manifest.json" },
			{ from: "./src/images/plugin_icon.png", to: "images/plugin_icon.png" },
			{
				from: "./src/images/plugin_icon_blue.png",
				to: "images/plugin_icon_blue.png",
			},
			{ from: "./src/aifex_page/", to: "aifex_page" },
			{ from: "./node_modules/bootstrap/dist/css/bootstrap.min.css", to: "aifex_page/css/bootstrap.min.css" },
			{ from: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "aifex_page/js/bootstrap.bundle.min.js" },
			{ from: "./node_modules/jquery/dist/jquery.min.js", to: "aifex_page/js/jquery.min.js" },
            { from: "./node_modules/font-awesome/css/font-awesome.min.css", to: "aifex_page/css/font-awesome.min.css" },
            { from: "./node_modules/font-awesome/fonts", to: "aifex_page/fonts" },
		]}),
	],
};
