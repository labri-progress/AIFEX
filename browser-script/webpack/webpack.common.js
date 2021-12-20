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
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: "ts-loader"
			},

		],
	}
};
