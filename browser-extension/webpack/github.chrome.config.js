const merge = require('webpack-merge');
const baseConfig = require('./base.chrome.config.js');
const webpack = require('webpack');

console.log("compiling plugin for chrome github")


module.exports = merge(baseConfig, {
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('github')
            }
        })
    ]
});