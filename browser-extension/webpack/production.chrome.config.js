const {merge} = require('webpack-merge');
const baseConfig = require('./base.chrome.config.js');
const webpack = require('webpack');


module.exports = () => {
    console.log("compiling plugin for chrome production")

    return merge(baseConfig, {
        mode: 'production',
        plugins: [
            new webpack.DefinePlugin({})
        ]
    })
};