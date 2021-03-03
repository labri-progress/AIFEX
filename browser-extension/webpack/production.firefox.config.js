const merge = require('webpack-merge');
const baseConfig = require('./base.firefox.config.js');
const webpack = require('webpack');


module.exports = () => {
    console.log("compiling plugin for host firefox production")
    return merge(baseConfig, {
        mode: 'production',
        plugins: [
            new webpack.DefinePlugin({})
        ]
    })
};