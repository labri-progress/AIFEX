const { merge } = require('webpack-merge');
const baseConfig = require('./base.firefox.config.js');
const webpack = require('webpack');

console.log("compiling plugin for firefox development")


module.exports = merge(baseConfig, {
    devtool: 'source-map',
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ]
});